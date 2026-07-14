import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import {
  MacroXmlDetails,
  TypeMacro,
  TypeMacroGroup,
  Preferences,
} from "./types";
import { runAppleScript } from "run-applescript";
import { parse } from "plist";

export async function fetchMacros() {
  const preferences = getPreferenceValues<Preferences>();

  try {
    const scriptResult =
      await runAppleScript(`tell application "Keyboard Maestro Engine"
            set macroList to getmacros with asstring
            end tell`);
    const data = parse(scriptResult) as TypeMacroGroup[];

    // Filtering groups with filter pattern and enabled groups
    const filterPattern = (preferences.filterPattern ?? "").trim();
    const hasFilter = filterPattern !== "";
    let matchFunction: (groupName: string) => boolean;

    if (hasFilter) {
      if (filterPattern.startsWith('"') && filterPattern.endsWith('"')) {
        const exactMatch = filterPattern.slice(1, -1).toLowerCase();
        matchFunction = (groupName) => groupName.toLowerCase() === exactMatch;
      } else if (preferences.useRegex) {
        let regexPattern: RegExp;
        try {
          regexPattern = new RegExp(filterPattern, "i");
        } catch {
          showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: "Invalid regular expression",
          });
          return;
        }
        matchFunction = (groupName) => regexPattern.test(groupName);
      } else {
        const partialMatch = filterPattern.toLowerCase();
        matchFunction = (groupName) =>
          groupName.toLowerCase().includes(partialMatch);
      }
    } else {
      matchFunction = () => true;
    }

    // Filtering groups with enabled macros
    const filteredData = data
      .filter(
        (group) => group.enabled && group.name && matchFunction(group.name),
      )
      .map((group) => {
        const macros = preferences.showDisabled
          ? group.macros
          : group.macros?.filter((macro) => macro.enabled);
        return { ...group, macros };
      });
    return filteredData;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Unable to list Keyboard Maestro macros", error);
    showToast({
      style: Toast.Style.Failure,
      title: "Unable to list macros",
      message,
    });
    return [];
  }
}

const SNIPPET_GROUP_UIDS = new Set([
  "D007C71B-0015-4099-BF0C-FD9323952F6A",
  "6293C84D-029B-46F2-8322-7AAB9DEBE55B",
]);

export async function fetchSnippetMacros() {
  try {
    const scriptResult =
      await runAppleScript(`tell application "Keyboard Maestro Engine"
            set macroList to getmacros with asstring
            end tell`);
    const data = parse(scriptResult) as TypeMacroGroup[];

    return data
      .filter((group) => group.uid && SNIPPET_GROUP_UIDS.has(group.uid))
      .flatMap((group) =>
        (group.macros ?? [])
          .filter((macro) => macro.enabled && macro.uid && macro.name)
          .map(
            (macro) =>
              ({
                ...macro,
                groupUid: group.uid,
                groupName: group.name,
              }) as TypeMacro,
          ),
      );
  } catch {
    showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: "Unable to load snippet macros",
    });
    return [];
  }
}

export async function fetchMacroXmlDetails(
  uid: string,
): Promise<MacroXmlDetails> {
  const script = `tell application "Keyboard Maestro"
    set macroXml to xml of macro id "${uid}"
    return macroXml
  end tell`;
  const macroXml = await runAppleScript(script);
  const data = parse(macroXml) as {
    Name?: string;
    UID?: string;
    Actions?: Array<{ MacroActionType?: string; Text?: string }>;
    Triggers?: Array<{ MacroTriggerType?: string; TypedString?: string }>;
  };

  const insertTextAction = data.Actions?.find(
    (action) => action.MacroActionType === "InsertText",
  );
  const typedStringTrigger = data.Triggers?.find(
    (trigger) => trigger.MacroTriggerType === "TypedString",
  );

  return {
    uid: data.UID ?? uid,
    name: data.Name ?? "",
    snippetText: insertTextAction?.Text ?? "",
    typedString: typedStringTrigger?.TypedString ?? "",
  };
}

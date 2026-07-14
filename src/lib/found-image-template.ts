import { randomInt, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build, parse } from "plist";

const REPOSITORY_ROOT =
  "/Users/singleton23/Documents/Development/KeyboardMaestroAssembler";
const TEMPLATE_DIRECTORY = path.join(REPOSITORY_ROOT, "templates");
const OUTPUT_DIRECTORY = "/Users/singleton23/Downloads";
const TEMPLATE_PATH = path.join(
  TEMPLATE_DIRECTORY,
  "action-groups",
  "01_interface",
  "raw",
  "01_interface_move-or-click-mouse-found-image-appearance.kmmacros",
);
const XML_TEMPLATES_GROUP = {
  Activate: "Normal",
  Name: "XML Templates",
  ToggleMacroUID: "C61DA356-F74A-42F2-93BA-58EFC65C3F60",
  UID: "EC24A379-A963-482B-B606-46ADABC35BB3",
};

export interface FoundImageAssemblerValues {
  name: string;
  lightTiffPath: string;
  darkTiffPath: string;
}

function validateRequired(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

function sanitizeFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function nextActionUid() {
  return randomInt(90000000, 99999999);
}

function ensureImageAction(action: Record<string, unknown>, label: string) {
  if (
    action.MacroActionType !== "MouseMoveAndClick" ||
    action.Relative !== "Image"
  ) {
    throw new Error(`${label} is not a found-image click action`);
  }
}

export async function assembleFoundImageTemplate(
  values: FoundImageAssemblerValues,
) {
  const macroName = validateRequired(values.name, "Name");
  const [template, lightImage, darkImage] = await Promise.all([
    readFile(TEMPLATE_PATH, "utf8"),
    readFile(validateRequired(values.lightTiffPath, "Light image")),
    readFile(validateRequired(values.darkTiffPath, "Dark image")),
  ]);

  const data = parse(template) as Array<
    Record<string, unknown> & {
      Macros: Array<
        Record<string, unknown> & { Actions?: Array<Record<string, unknown>> }
      >;
    }
  >;
  const group = data[0];
  const macro = data[0]?.Macros?.[0];
  const ifAction = macro?.Actions?.[0] as
    | (Record<string, unknown> & {
        Conditions?: { ConditionList?: Array<Record<string, unknown>> };
        ThenActions?: Array<Record<string, unknown>>;
        ElseActions?: Array<Record<string, unknown>>;
      })
    | undefined;

  if (!group || !macro || ifAction?.MacroActionType !== "IfThenElse") {
    throw new Error(
      "Found-image template does not contain the expected If/Then action",
    );
  }

  const condition = ifAction.Conditions?.ConditionList?.[0];
  const originalThenActions = ifAction.ThenActions ?? [];
  const originalElseActions = ifAction.ElseActions ?? [];
  const darkAction = originalThenActions.find(
    (action) => action.MacroActionType === "MouseMoveAndClick",
  );
  const pauseAction = originalThenActions.find(
    (action) => action.MacroActionType === "Pause",
  );
  const lightAction = originalElseActions.find(
    (action) => action.MacroActionType === "MouseMoveAndClick",
  );

  if (
    !condition ||
    condition.ConditionType !== "ScreenImage" ||
    !lightAction ||
    !darkAction
  ) {
    throw new Error(
      "Found-image template is missing expected light/dark image slots",
    );
  }

  ensureImageAction(lightAction, "Light action");
  ensureImageAction(darkAction, "Dark action");

  group.Activate = XML_TEMPLATES_GROUP.Activate;
  group.Name = XML_TEMPLATES_GROUP.Name;
  group.ToggleMacroUID = XML_TEMPLATES_GROUP.ToggleMacroUID;
  group.UID = XML_TEMPLATES_GROUP.UID;
  delete group.CustomIconData;
  delete group.FocussedWindowConditionType;
  delete group.FocussedWindowTitle;
  delete group.Targeting;

  macro.Name = macroName;
  macro.UID = randomUUID().toUpperCase();
  macro.IsActive = false;
  delete macro.CustomIconData;
  if (typeof macro.CreationDate === "number") {
    macro.CreationDate = Date.now() / 1000;
  }
  if (typeof macro.ModificationDate === "number") {
    macro.ModificationDate = Date.now() / 1000;
  }

  ifAction.ActionUID = nextActionUid();
  condition.Image = lightImage;
  lightAction.ActionUID = nextActionUid();
  lightAction.ActionName = "light mode - found image";
  lightAction.Image = lightImage;
  darkAction.ActionUID = nextActionUid();
  darkAction.ActionName = "dark mode - found image";
  darkAction.Image = darkImage;
  if (pauseAction) {
    pauseAction.ActionUID = nextActionUid();
  }

  ifAction.ThenActions = pauseAction
    ? [lightAction, pauseAction]
    : [lightAction];
  ifAction.ElseActions = [darkAction];

  const assembled = build(data as Parameters<typeof build>[0]);
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const outputPath = path.join(
    OUTPUT_DIRECTORY,
    `found-image-${sanitizeFilePart(macroName) || "macro"}.kmmacros`,
  );
  await writeFile(outputPath, assembled, "utf8");

  return {
    assembled,
    outputPath,
    templatePath: TEMPLATE_PATH,
  };
}

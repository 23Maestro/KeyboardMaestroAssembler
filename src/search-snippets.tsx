import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import Fuse from "fuse.js";
import { useState } from "react";
import { runAppleScript } from "run-applescript";
import { fetchMacroXmlDetails, fetchSnippetMacros } from "./lib/fetch-macros";
import { MacroXmlDetails, TypeMacro } from "./lib/types";

function editMacro(macro: TypeMacro) {
  return runAppleScript(
    `tell application "Keyboard Maestro"
        editMacro "${macro.uid}"
        activate
      end tell`,
  );
}

function snippetMarkdown(macro: TypeMacro, details?: MacroXmlDetails) {
  const body = details?.snippetText || "_No snippet content found_";
  return ["# " + (macro.name ?? "Snippet"), "", body].join("\n");
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const {
    data: snippets = [],
    isLoading,
    revalidate,
  } = useCachedPromise(fetchSnippetMacros);

  let filteredSnippets = snippets;
  if (searchText) {
    const fuse = new Fuse(snippets, {
      keys: ["name", "triggers.short"],
      threshold: 0.35,
    });

    filteredSnippets = fuse.search(searchText).map(({ item }) => item);
  }

  const selectedMacro =
    filteredSnippets.find((macro) => macro.uid === selectedItemId) ??
    filteredSnippets[0];
  const { data: selectedDetails } = useCachedPromise(
    async (uid: string) => fetchMacroXmlDetails(uid),
    [selectedMacro?.uid ?? ""],
    {
      execute: Boolean(selectedMacro?.uid),
    },
  );

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      searchText={searchText}
      onSearchTextChange={setSearchText}
      selectedItemId={selectedItemId}
      onSelectionChange={(id) => setSelectedItemId(id ?? undefined)}
    >
      {filteredSnippets.map((macro) => {
        const trigger = macro.triggers?.find(
          (item) => item.type === "Typed String Trigger",
        )?.short;

        return (
          <List.Item
            key={macro.uid}
            id={macro.uid}
            title={macro.name ?? ""}
            subtitle={macro.groupName ?? ""}
            icon={Icon.Text}
            accessories={trigger ? [{ tag: { value: trigger } }] : undefined}
            detail={
              <List.Item.Detail
                markdown={
                  selectedMacro?.uid === macro.uid
                    ? snippetMarkdown(macro, selectedDetails)
                    : snippetMarkdown(macro)
                }
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Group"
                      text={macro.groupName ?? ""}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Trigger"
                      text={
                        selectedMacro?.uid === macro.uid
                          ? selectedDetails?.typedString || trigger || ""
                          : trigger || ""
                      }
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action.Open
                  title="Run Snippet"
                  target={`kmtrigger://macro=${macro.uid}`}
                  icon={Icon.Terminal}
                />
                <Action
                  title="Edit Macro"
                  onAction={() => {
                    editMacro(macro);
                  }}
                  icon={Icon.Pencil}
                  shortcut={{ key: "e", modifiers: ["cmd"] }}
                />
                <Action
                  title="Refetch Snippets"
                  icon={Icon.ArrowClockwise}
                  onAction={revalidate}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

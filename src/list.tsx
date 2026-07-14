import { LaunchProps, List, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { Preferences } from "./lib/types";
import { MacroActionPanel } from "./components/action-panel";
import { useCachedPromise } from "@raycast/utils";
import { fetchMacros } from "./lib/fetch-macros";
import Fuse from "fuse.js";

interface Arguments {
  name?: string;
}

export default function Command(props: LaunchProps<{ arguments: Arguments }>) {
  const { isLoading, data, revalidate } = useCachedPromise(fetchMacros);
  const preferences = getPreferenceValues<Preferences>();

  const [searchText, setSearchText] = useState(props.arguments.name ?? "");
  const [filteredList, setFilteredList] = useState(data);

  const displayTypes: string[] = [];
  if (preferences.displayTriggers) {
    displayTypes.push("Typed String Trigger");
  }
  if (preferences.displayShortcuts) {
    displayTypes.push("Hot Key Trigger");
  }

  useEffect(() => {
    if (data) {
      if (!searchText) {
        setFilteredList(data);
      } else {
        const macros = data.flatMap((item) => item.macros || []);
        const normalizedSearch = searchText.trim().toLowerCase();

        const macroFuse = new Fuse(macros, {
          keys: ["name"],
          threshold: 0.4,
        });
        const groupFuse = new Fuse(data, {
          keys: ["name"],
          threshold: 0.4,
        });
        const macroResult = new Set(
          macroFuse.search(searchText).map(({ item }) => item),
        );
        const groupResult = new Set(
          groupFuse.search(searchText).map(({ item }) => item.uid),
        );

        const groupedResult = data
          .map((group) => {
            const groupName = group.name?.toLowerCase() ?? "";
            const isGroupMatch =
              group.uid && groupResult.has(group.uid)
                ? true
                : groupName.includes(normalizedSearch);

            const groupedMacros = isGroupMatch
              ? group.macros
              : group.macros?.filter((macro) => macroResult.has(macro));

            return {
              ...group,
              macros: groupedMacros,
            };
          })
          .filter((group) => (group.macros?.length ?? 0) > 0);
        setFilteredList(groupedResult);
      }
    }
  }, [searchText, data]);

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
    >
      {filteredList?.map((group) => (
        <List.Section
          key={group.uid}
          title={`${group.name}`}
          subtitle={`${group.macros?.length}`}
        >
          {group.macros?.map((macro) => {
            const triggers = macro.triggers
              ?.filter(
                (trigger) =>
                  trigger.type && displayTypes.includes(trigger.type),
              )
              .map((trigger) => ({ tag: { value: trigger.short } }));
            return (
              <List.Item
                key={macro.uid}
                title={macro.enabled ? (macro?.name ?? "") : ""}
                subtitle={macro.enabled ? "" : (macro?.name ?? "")}
                icon={preferences.displayIcon ? "kmicon_32.png" : undefined}
                accessories={triggers}
                actions={
                  <MacroActionPanel macro={macro} revalidate={revalidate} />
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}

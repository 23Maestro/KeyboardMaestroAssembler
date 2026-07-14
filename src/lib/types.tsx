export interface Preferences {
  displayShortcuts: boolean;
  displayTriggers: boolean;
  displayIcon: boolean;
  filterPattern: string;
  useRegex: boolean;
  showDisabled: boolean;
}

export type TypeMacro = Partial<{
  name: string;
  uid: string;
  groupUid: string;
  groupName: string;
  active: boolean;
  created: number;
  used: number;
  enabled: boolean;
  lastused: number;
  modified: number;
  saved: number;
  sort: string;
  triggers: Array<
    Partial<{ description: string; short: string; type: string }>
  >;
}>;

export type TypeMacroGroup = Partial<{
  uid: string;
  enabled: boolean;
  name: string;
  sort: string;
  macros: TypeMacro[];
}>;

export interface MacroXmlDetails {
  uid: string;
  name: string;
  snippetText: string;
  typedString: string;
}

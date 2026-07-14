/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Display Details - Do you want to display macro shortcuts? */
  "displayShortcuts": boolean,
  /** undefined - Do you want to display macro text triggers? */
  "displayTriggers": boolean,
  /** undefined - Do you want to display icons? */
  "displayIcon": boolean,
  /** Filter Macro Groups - Enter a group name to filter. Use double quotes for an exact match; otherwise, it will be treated as a partial name. */
  "filterPattern": string,
  /** undefined - Use regex to filter macro groups */
  "useRegex": boolean,
  /** Filter Macros - Do you want to include disabled macros? */
  "showDisabled": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list` command */
  export type List = ExtensionPreferences & {}
  /** Preferences accessible in the `assemble` command */
  export type Assemble = ExtensionPreferences & {}
  /** Preferences accessible in the `assemble-found-image` command */
  export type AssembleFoundImage = ExtensionPreferences & {}
  /** Preferences accessible in the `create-snippet` command */
  export type CreateSnippet = ExtensionPreferences & {}
  /** Preferences accessible in the `search-snippets` command */
  export type SearchSnippets = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list` command */
  export type List = {
  /** Macro Name */
  "name": string
}
  /** Arguments passed to the `assemble` command */
  export type Assemble = {}
  /** Arguments passed to the `assemble-found-image` command */
  export type AssembleFoundImage = {}
  /** Arguments passed to the `create-snippet` command */
  export type CreateSnippet = {}
  /** Arguments passed to the `search-snippets` command */
  export type SearchSnippets = {}
}


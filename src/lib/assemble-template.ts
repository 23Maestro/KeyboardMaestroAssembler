import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const REPOSITORY_ROOT =
  "/Users/singleton23/Documents/Development/KeyboardMaestroAssembler";
const TEMPLATE_DIRECTORY = path.join(REPOSITORY_ROOT, "templates");
const OUTPUT_DIRECTORY = "/Users/singleton23/Downloads";
const INTERFACE_SLOTIZED_DIRECTORY = path.join(
  TEMPLATE_DIRECTORY,
  "action-groups",
  "01_interface",
  "slotized",
);
const TEXT_SNIPPETS_SLOTIZED_DIRECTORY = path.join(
  TEMPLATE_DIRECTORY,
  "action-groups",
  "02_text-snippets",
  "slotized",
);
const TWO_CLICK_TEMPLATE_NAME =
  "01_interface_move-or-click-mouse-two-clicks.kmmacros";
const ONE_CLICK_TEMPLATE_NAME =
  "01_interface_move-or-click-mouse-one-click.kmmacros";
const SLOT_NAMES = ["X1", "Y1", "X2", "Y2", "UUID_MACRO"] as const;
const SINGLE_CLICK_SLOT_NAMES = ["X1", "Y1", "UUID_MACRO"] as const;
const SNIPPET_SLOT_NAMES = [
  "SNIPPET_NAME",
  "SNIPPET_TRIGGER",
  "SNIPPET_TEXT",
  "UUID_MACRO",
] as const;

export interface AssemblerValues {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

export interface SingleClickAssemblerValues {
  x1: string;
  y1: string;
}

export interface SnippetAssemblerValues {
  template: string;
  name: string;
  trigger: string;
  text: string;
}

const SNIPPET_TEMPLATE_FILES = {
  standard: "01_text-snippets_insert-text-standard.kmmacros",
  development: "02_text-snippets_insert-text-codex-superpowers.kmmacros",
} as const;

export const SNIPPET_TEMPLATES = {
  standard: "standard",
  development: "development",
} as const;

export type SnippetTemplate =
  (typeof SNIPPET_TEMPLATES)[keyof typeof SNIPPET_TEMPLATES];

function getInterfaceTemplatePath(templateName: string) {
  return path.join(INTERFACE_SLOTIZED_DIRECTORY, templateName);
}

function getTextSnippetTemplatePath(templateName: string) {
  return path.join(TEXT_SNIPPETS_SLOTIZED_DIRECTORY, templateName);
}

function validateCoordinate(value: string, label: string) {
  const trimmed = value.trim();

  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    throw new Error(`${label} must be a number`);
  }

  return trimmed;
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

function escapeXmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function resolveSnippetTemplate(template: string) {
  if (template === SNIPPET_TEMPLATES.development) {
    return SNIPPET_TEMPLATE_FILES.development;
  }

  return SNIPPET_TEMPLATE_FILES.standard;
}

export async function assembleMoveClickPauseMoveClick(values: AssemblerValues) {
  const templatePath = getInterfaceTemplatePath(TWO_CLICK_TEMPLATE_NAME);
  const template = await readFile(templatePath, "utf8");

  const replacements = {
    "{{X1}}": validateCoordinate(values.x1, "X1"),
    "{{Y1}}": validateCoordinate(values.y1, "Y1"),
    "{{X2}}": validateCoordinate(values.x2, "X2"),
    "{{Y2}}": validateCoordinate(values.y2, "Y2"),
    "{{UUID_MACRO}}": randomUUID().toUpperCase(),
  };

  let assembled = template;
  for (const [slot, value] of Object.entries(replacements)) {
    assembled = assembled.split(slot).join(value);
  }

  for (const slotName of SLOT_NAMES) {
    if (assembled.includes(`{{${slotName}}}`)) {
      throw new Error(`Template slot ${slotName} was not replaced`);
    }
  }

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  const outputPath = path.join(
    OUTPUT_DIRECTORY,
    `2-clicks-${replacements["{{X1}}"]}-${replacements["{{Y1}}"]}-${replacements["{{X2}}"]}-${replacements["{{Y2}}"]}.kmmacros`,
  );

  await writeFile(outputPath, assembled, "utf8");

  return {
    assembled,
    outputPath,
    templatePath,
  };
}

export async function assembleSingleClick(values: SingleClickAssemblerValues) {
  const templatePath = getInterfaceTemplatePath(ONE_CLICK_TEMPLATE_NAME);
  const template = await readFile(templatePath, "utf8");

  const replacements = {
    "{{X1}}": validateCoordinate(values.x1, "X1"),
    "{{Y1}}": validateCoordinate(values.y1, "Y1"),
    "{{UUID_MACRO}}": randomUUID().toUpperCase(),
  };

  let assembled = template;
  for (const [slot, value] of Object.entries(replacements)) {
    assembled = assembled.split(slot).join(value);
  }

  for (const slotName of SINGLE_CLICK_SLOT_NAMES) {
    if (assembled.includes(`{{${slotName}}}`)) {
      throw new Error(`Template slot ${slotName} was not replaced`);
    }
  }

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  const outputPath = path.join(
    OUTPUT_DIRECTORY,
    `1-click-${replacements["{{X1}}"]}-${replacements["{{Y1}}"]}.kmmacros`,
  );

  await writeFile(outputPath, assembled, "utf8");

  return {
    assembled,
    outputPath,
    templatePath,
  };
}

export async function assembleSnippet(values: SnippetAssemblerValues) {
  const templateName = resolveSnippetTemplate(values.template);
  const templatePath = getTextSnippetTemplatePath(templateName);
  const template = await readFile(templatePath, "utf8");

  const replacements = {
    "{{SNIPPET_NAME}}": escapeXmlText(validateRequired(values.name, "Name")),
    "{{SNIPPET_TRIGGER}}": escapeXmlText(
      validateRequired(values.trigger, "Trigger"),
    ),
    "{{SNIPPET_TEXT}}": escapeXmlText(validateRequired(values.text, "Text")),
    "{{UUID_MACRO}}": randomUUID().toUpperCase(),
  };

  let assembled = template;
  for (const [slot, value] of Object.entries(replacements)) {
    assembled = assembled.split(slot).join(value);
  }

  for (const slotName of SNIPPET_SLOT_NAMES) {
    if (assembled.includes(`{{${slotName}}}`)) {
      throw new Error(`Template slot ${slotName} was not replaced`);
    }
  }

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  const fileStem =
    sanitizeFilePart(validateRequired(values.name, "Name")) || "snippet";
  const outputPath = path.join(
    OUTPUT_DIRECTORY,
    `snippet-${fileStem}.kmmacros`,
  );

  await writeFile(outputPath, assembled, "utf8");

  return {
    assembled,
    outputPath,
    templatePath,
  };
}

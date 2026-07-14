import { randomInt, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build, parse } from "plist";

const repoRoot = "/Users/singleton23/Documents/Development/KeyboardMaestroAssembler";
const templatePath = path.join(
  repoRoot,
  "templates",
  "Light-Dark Mode Auto TEST.kmmacros",
);
const outputPath = path.join(
  "/Users/singleton23/Downloads",
  "Capture Found Image Pair - CleanShot.kmmacros",
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextActionUid() {
  return randomInt(90000000, 99999999);
}

function cloneAction(action) {
  return {
    ...clone(action),
    ActionUID: nextActionUid(),
  };
}

function clonePause(action, seconds) {
  return {
    ...cloneAction(action),
    Time: String(seconds),
  };
}

const data = parse(await readFile(templatePath, "utf8"));
const group = data[0];
const sourceMacro = group?.Macros?.[0];
const actions = sourceMacro?.Actions ?? [];

const firstCapture = actions[0];
const firstPause = actions[1];
const returnKey = actions[2];
const afterReturnPause = actions[3];
const toggleAppearance = actions[4];
const afterTogglePause = actions[5];
const secondCapture = actions[6];
const secondCapturePause = actions[7];

if (
  !group ||
  !sourceMacro ||
  firstCapture?.MacroActionType !== "ExecuteShellScript" ||
  firstPause?.MacroActionType !== "Pause" ||
  returnKey?.MacroActionType !== "SimulateKeystroke" ||
  afterReturnPause?.MacroActionType !== "Pause" ||
  toggleAppearance?.MacroActionType !== "OpenURL" ||
  afterTogglePause?.MacroActionType !== "Pause" ||
  secondCapture?.MacroActionType !== "ExecuteShellScript" ||
  secondCapturePause?.MacroActionType !== "Pause"
) {
  throw new Error("Exported test macro does not match the expected action list");
}

const macro = clone(sourceMacro);
macro.Name = "Capture Found Image Pair - CleanShot";
macro.UID = randomUUID().toUpperCase();
macro.CreationDate = Date.now() / 1000;
macro.ModificationDate = Date.now() / 1000;
macro.Actions = [
  cloneAction(firstCapture),
  clonePause(firstPause, 5),
  cloneAction(returnKey),
  clonePause(afterReturnPause, 1.5),
  cloneAction(toggleAppearance),
  clonePause(afterTogglePause, 1.5),
  cloneAction(secondCapture),
  clonePause(secondCapturePause, 5),
  cloneAction(returnKey),
  clonePause(afterReturnPause, 1.5),
  cloneAction(toggleAppearance),
];

group.Macros = [macro];

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, build(data), "utf8");
console.log(outputPath);

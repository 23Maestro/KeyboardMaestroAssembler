import { runAppleScript } from "run-applescript";

export interface MouseClickVariables {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

export async function fetchMouseClickVariables(): Promise<MouseClickVariables> {
  const result =
    await runAppleScript(`tell application "Keyboard Maestro Engine"
    set x1 to getvariable "MouseClickX1"
    set y1 to getvariable "MouseClickY1"
    set x2 to getvariable "MouseClickX2"
    set y2 to getvariable "MouseClickY2"
    return x1 & linefeed & y1 & linefeed & x2 & linefeed & y2
  end tell`);

  const [x1 = "", y1 = "", x2 = "", y2 = ""] = result.split("\n");
  return { x1, y1, x2, y2 };
}

import {
  Action,
  ActionPanel,
  Form,
  Icon,
  open,
  popToRoot,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  assembleMoveClickPauseMoveClick,
  assembleSingleClick,
} from "./lib/assemble-template";
import { fetchMouseClickVariables } from "./lib/fetch-km-variables";

interface FormValues {
  template: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

const TEMPLATE_OPTIONS = {
  single: "single",
  double: "double",
} as const;

function variableStatus(
  template: string,
  values: { x1: string; y1: string; x2: string; y2: string },
) {
  const singleReady = Boolean(values.x1.trim() && values.y1.trim());
  const doubleReady = Boolean(
    values.x1.trim() &&
    values.y1.trim() &&
    values.x2.trim() &&
    values.y2.trim(),
  );

  if (template === TEMPLATE_OPTIONS.single) {
    return singleReady
      ? "KM variables ready for 1 Click"
      : "Missing MouseClickX1 or MouseClickY1";
  }

  return doubleReady
    ? "KM variables ready for 2 Clicks"
    : "Missing one or more MouseClick variables";
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<string>(TEMPLATE_OPTIONS.single);
  const [x1, setX1] = useState("");
  const [y1, setY1] = useState("");
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");
  const statusText = variableStatus(template, { x1, y1, x2, y2 });

  async function loadFromKeyboardMaestroVariables() {
    try {
      const values = await fetchMouseClickVariables();
      setX1(values.x1);
      setY1(values.y1);
      setX2(values.x2);
      setY2(values.y2);

      if (!values.x1 && !values.y1 && !values.x2 && !values.y2) {
        await showToast({
          style: Toast.Style.Failure,
          title: "No mouse variables found",
          message: "Set MouseClickX/Y variables in Keyboard Maestro first",
        });
        return;
      }

      await showToast({
        style: Toast.Style.Success,
        title: "Loaded KM variables",
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Unable to load KM variables",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  useEffect(() => {
    loadFromKeyboardMaestroVariables();
  }, []);

  async function handleSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const result =
        values.template === TEMPLATE_OPTIONS.single
          ? await assembleSingleClick(values)
          : await assembleMoveClickPauseMoveClick(values);

      await showToast({
        style: Toast.Style.Success,
        title: "Template assembled",
        message: result.outputPath,
      });

      await open(result.outputPath);
      await popToRoot({ clearSearchBar: true });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Unable to assemble template",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Assemble XML" onSubmit={handleSubmit} />
          <Action
            title="Load from KM Variables"
            onAction={loadFromKeyboardMaestroVariables}
            icon={Icon.Download}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="template"
        title="Template"
        value={template}
        onChange={setTemplate}
      >
        <Form.Dropdown.Item title="1 Click" value={TEMPLATE_OPTIONS.single} />
        <Form.Dropdown.Item title="2 Clicks" value={TEMPLATE_OPTIONS.double} />
      </Form.Dropdown>
      <Form.Description title="Status" text={statusText} />
      <Form.TextField
        id="x1"
        title={template === TEMPLATE_OPTIONS.double ? "Click 1 X" : "Click X"}
        placeholder="313"
        value={x1}
        onChange={setX1}
      />
      <Form.TextField
        id="y1"
        title={template === TEMPLATE_OPTIONS.double ? "Click 1 Y" : "Click Y"}
        placeholder="230"
        value={y1}
        onChange={setY1}
      />
      {template === TEMPLATE_OPTIONS.double ? (
        <>
          <Form.TextField
            id="x2"
            title="Click 2 X"
            placeholder="310"
            value={x2}
            onChange={setX2}
          />
          <Form.TextField
            id="y2"
            title="Click 2 Y"
            placeholder="357"
            value={y2}
            onChange={setY2}
          />
        </>
      ) : null}
    </Form>
  );
}

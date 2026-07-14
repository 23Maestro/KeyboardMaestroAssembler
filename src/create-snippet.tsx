import {
  Action,
  ActionPanel,
  Form,
  open,
  popToRoot,
  showToast,
  Toast,
} from "@raycast/api";
import { useRef, useState } from "react";
import { assembleSnippet, SNIPPET_TEMPLATES } from "./lib/assemble-template";

interface FormValues {
  template: string;
  name: string;
  trigger: string;
  text: string;
}

const DEFAULT_VALUES = {
  [SNIPPET_TEMPLATES.standard]: {
    name: "",
    trigger: "",
    text: "",
  },
  [SNIPPET_TEMPLATES.development]: {
    name: "CODEX: ",
    trigger: "",
    text: "",
  },
} as const;

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<string>(SNIPPET_TEMPLATES.standard);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [text, setText] = useState("");
  const nameRef = useRef<Form.TextField>(null);

  function handleTemplateChange(nextTemplate: string) {
    const isDevelopment = nextTemplate === SNIPPET_TEMPLATES.development;
    const defaults = isDevelopment
      ? DEFAULT_VALUES[SNIPPET_TEMPLATES.development]
      : DEFAULT_VALUES[SNIPPET_TEMPLATES.standard];

    setTemplate(nextTemplate);
    setName(defaults.name);
    setTrigger(defaults.trigger);
    setText(defaults.text);

    if (isDevelopment) {
      setTimeout(() => nameRef.current?.focus(), 0);
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const result = await assembleSnippet(values);
      await showToast({
        style: Toast.Style.Success,
        title: "Snippet assembled",
        message: result.outputPath,
      });

      await open(result.outputPath);
      await popToRoot({ clearSearchBar: true });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Unable to create snippet",
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
          <Action.SubmitForm title="Create Snippet" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="template"
        title="Template"
        value={template}
        onChange={handleTemplateChange}
        autoFocus
      >
        <Form.Dropdown.Item
          title="Standard"
          value={SNIPPET_TEMPLATES.standard}
        />
        <Form.Dropdown.Item
          title="Development"
          value={SNIPPET_TEMPLATES.development}
        />
      </Form.Dropdown>
      <Form.TextField
        id="name"
        title="Name"
        value={name}
        onChange={setName}
        ref={nameRef}
      />
      <Form.TextField
        id="trigger"
        title="Trigger"
        value={trigger}
        onChange={setTrigger}
      />
      <Form.TextArea id="text" title="Text" value={text} onChange={setText} />
    </Form>
  );
}

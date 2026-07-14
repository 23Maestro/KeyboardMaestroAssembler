import {
  Action,
  ActionPanel,
  Grid,
  Icon,
  Keyboard,
  PopToRootType,
  closeMainWindow,
  environment,
  open,
  popToRoot,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { runAppleScript } from "run-applescript";
import { useEffect, useState } from "react";
import { setTimeout as sleep } from "node:timers/promises";
import { assembleFoundImageTemplate } from "./lib/found-image-template";
import {
  CachedFoundImages,
  FOUND_IMAGE_SCREENSHOT_DIRECTORY,
  ScreenshotCandidate,
  cacheFoundImages,
  cacheLatestFoundImages,
  findLatestScreenshotCandidates,
} from "./lib/latest-screenshots";

const CAPTURE_MACRO_ID = "979798EC-E7BF-4EF3-9D29-289EC4061B11";
const DEFAULT_MACRO_NAME = "Found Image Click";

function formatDate(value: number) {
  return new Date(value).toLocaleString();
}

function PreviewActions(props: {
  cache?: CachedFoundImages;
  captureScreenshots: () => Promise<void>;
  buildClickImages: () => Promise<void>;
  openImagePicker: (mode: "light" | "dark") => void;
}) {
  return (
    <ActionPanel>
      <Action
        title="Build Click Images"
        icon={Icon.Hammer}
        onAction={props.buildClickImages}
      />
      <Action
        title="Refresh Screenshots"
        icon={Icon.Camera}
        shortcut={Keyboard.Shortcut.Common.Refresh}
        onAction={props.captureScreenshots}
      />
      <ActionPanel.Section>
        {props.cache ? (
          <>
            <Action.ToggleQuickLook
              shortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
            />
            <Action
              title="Select Light Image"
              icon={Icon.Image}
              shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
              onAction={() => props.openImagePicker("light")}
            />
            <Action
              title="Select Dark Image"
              icon={Icon.Image}
              shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
              onAction={() => props.openImagePicker("dark")}
            />
            <Action.ShowInFinder
              title="Show Cached Images"
              path={props.cache.cacheDirectory}
            />
          </>
        ) : null}
      </ActionPanel.Section>
    </ActionPanel>
  );
}

function ScreenshotPicker(props: {
  mode: "light" | "dark";
  candidates: ScreenshotCandidate[];
  onSelect: (candidate: ScreenshotCandidate) => Promise<void>;
}) {
  return (
    <Grid
      navigationTitle={`Select ${props.mode === "light" ? "Light" : "Dark"} Image`}
      columns={3}
      aspectRatio="16/9"
      fit={Grid.Fit.Contain}
    >
      {props.candidates.map((candidate) => (
        <Grid.Item
          key={candidate.path}
          title={formatDate(candidate.modifiedAt)}
          content={candidate.path}
          quickLook={{ path: candidate.path }}
          actions={
            <ActionPanel>
              <Action
                title={`Use as ${props.mode === "light" ? "Light" : "Dark"}`}
                icon={Icon.CheckCircle}
                onAction={() => props.onSelect(candidate)}
              />
              <Action.ToggleQuickLook
                shortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
              />
              <Action.ShowInFinder path={candidate.path} />
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}

function PreviewItem(props: {
  title: string;
  image: ScreenshotCandidate;
  actions: React.ReactNode;
}) {
  return (
    <Grid.Item
      id={props.title.toLowerCase()}
      title={props.title}
      subtitle={formatDate(props.image.modifiedAt)}
      content={props.image.path}
      quickLook={{ path: props.image.path }}
      actions={props.actions}
    />
  );
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [cache, setCache] = useState<CachedFoundImages>();
  const [candidates, setCandidates] = useState<ScreenshotCandidate[]>([]);
  const [status, setStatus] = useState("Scanning latest screenshots");
  const { push, pop } = useNavigation();

  async function captureScreenshots() {
    setStatus("Starting capture macro");
    try {
      await closeMainWindow({
        clearRootSearch: true,
        popToRootType: PopToRootType.Immediate,
      });
      await sleep(150);
      await runAppleScript(`ignoring application responses
tell application "Keyboard Maestro Engine"
  do script "${CAPTURE_MACRO_ID}"
end tell
end ignoring`);
      setStatus("Preview ready...");
      await showToast({
        style: Toast.Style.Success,
        title: "Capture started",
      });
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to start capture",
      );
      await showToast({
        style: Toast.Style.Failure,
        title: "Capture failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async function refreshImages() {
    setIsLoading(true);
    try {
      const latest = await findLatestScreenshotCandidates(8);
      setCandidates(latest);
      if (latest.length < 2) {
        throw new Error(
          `Need two images in ${FOUND_IMAGE_SCREENSHOT_DIRECTORY}`,
        );
      }

      const cached = await cacheLatestFoundImages(environment.supportPath);
      setCache(cached);
      setStatus("Preview ready...");
      await showToast({
        style: Toast.Style.Success,
        title: "Preview refreshed",
      });
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to load screenshots",
      );
      await showToast({
        style: Toast.Style.Failure,
        title: "Screenshots not ready",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshImages();
  }, []);

  async function buildClickImages() {
    setIsLoading(true);

    try {
      const cached =
        cache ?? (await cacheLatestFoundImages(environment.supportPath));
      setCache(cached);
      const result = await assembleFoundImageTemplate({
        name: DEFAULT_MACRO_NAME,
        lightTiffPath: cached.lightTiffPath,
        darkTiffPath: cached.darkTiffPath,
      });

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

  async function selectImage(
    mode: "light" | "dark",
    image: ScreenshotCandidate,
  ) {
    if (!cache) {
      return;
    }

    const cached = await cacheFoundImages(environment.supportPath, {
      light: mode === "light" ? image : cache.light,
      dark: mode === "dark" ? image : cache.dark,
    });
    setCache(cached);
    setStatus("Preview ready...");
    await showToast({
      style: Toast.Style.Success,
      title: mode === "light" ? "Light selected" : "Dark selected",
    });
    pop();
  }

  function openImagePicker(mode: "light" | "dark") {
    push(
      <ScreenshotPicker
        mode={mode}
        candidates={candidates}
        onSelect={(image) => selectImage(mode, image)}
      />,
    );
  }

  const previewActions = (
    <PreviewActions
      cache={cache}
      captureScreenshots={captureScreenshots}
      buildClickImages={buildClickImages}
      openImagePicker={openImagePicker}
    />
  );

  return (
    <Grid
      isLoading={isLoading}
      navigationTitle="Found Image Preview"
      searchBarPlaceholder={status}
      columns={2}
      aspectRatio="16/9"
      fit={Grid.Fit.Contain}
      actions={previewActions}
    >
      {cache ? (
        <>
          <PreviewItem
            title="Light"
            image={cache.light}
            actions={previewActions}
          />
          <PreviewItem
            title="Dark"
            image={cache.dark}
            actions={previewActions}
          />
        </>
      ) : (
        <Grid.EmptyView
          title="No Preview"
          description={status}
          actions={previewActions}
        />
      )}
    </Grid>
  );
}

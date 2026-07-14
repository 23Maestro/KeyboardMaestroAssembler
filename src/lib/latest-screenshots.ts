import { execFile } from "node:child_process";
import { constants } from "node:fs";
import {
  access,
  copyFile,
  mkdir,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".tif", ".tiff"]);
export const FOUND_IMAGE_SCREENSHOT_DIRECTORY =
  "/Users/singleton23/Documents/x-screenshots";

export interface ScreenshotCandidate {
  path: string;
  modifiedAt: number;
  source: string;
}

export interface CachedFoundImages {
  light: ScreenshotCandidate;
  dark: ScreenshotCandidate;
  cacheDirectory: string;
  lightImagePath: string;
  darkImagePath: string;
  lightTiffPath: string;
  darkTiffPath: string;
}

async function pathExists(filePath: string) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectImages(
  directory: string,
  source: string,
  options: { depth: number },
  output: ScreenshotCandidate[],
) {
  if (options.depth < 0 || !(await pathExists(directory))) {
    return;
  }

  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectImages(
        entryPath,
        source,
        { ...options, depth: options.depth - 1 },
        output,
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) {
      continue;
    }

    const stats = await stat(entryPath);
    output.push({
      path: entryPath,
      modifiedAt: stats.mtimeMs,
      source,
    });
  }
}

export async function findLatestScreenshotCandidates(
  limit = 12,
): Promise<ScreenshotCandidate[]> {
  const candidates: ScreenshotCandidate[] = [];
  await collectImages(
    FOUND_IMAGE_SCREENSHOT_DIRECTORY,
    "x-screenshots",
    { depth: 0 },
    candidates,
  );

  return candidates.sort((a, b) => b.modifiedAt - a.modifiedAt).slice(0, limit);
}

async function convertToTiff(sourcePath: string, outputPath: string) {
  await execFileAsync("sips", [
    "-s",
    "format",
    "tiff",
    sourcePath,
    "--out",
    outputPath,
  ]);
}

export async function cacheLatestFoundImages(
  supportPath: string,
): Promise<CachedFoundImages> {
  const candidates = await findLatestScreenshotCandidates(2);
  if (candidates.length < 2) {
    throw new Error(`Need two images in ${FOUND_IMAGE_SCREENSHOT_DIRECTORY}`);
  }

  const [dark, light] = candidates;
  return cacheFoundImages(supportPath, { light, dark });
}

export async function cacheFoundImages(
  supportPath: string,
  images: { light: ScreenshotCandidate; dark: ScreenshotCandidate },
): Promise<CachedFoundImages> {
  const cacheDirectory = path.join(supportPath, "found-images");
  await mkdir(cacheDirectory, { recursive: true });

  const lightImagePath = path.join(
    cacheDirectory,
    "light-source" + path.extname(images.light.path).toLowerCase(),
  );
  const darkImagePath = path.join(
    cacheDirectory,
    "dark-source" + path.extname(images.dark.path).toLowerCase(),
  );
  const lightTiffPath = path.join(cacheDirectory, "light.tiff");
  const darkTiffPath = path.join(cacheDirectory, "dark.tiff");
  const manifestPath = path.join(cacheDirectory, "latest.json");

  await copyFile(images.light.path, lightImagePath);
  await copyFile(images.dark.path, darkImagePath);
  await convertToTiff(images.light.path, lightTiffPath);
  await convertToTiff(images.dark.path, darkTiffPath);
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        mapping: "preview light and dark images are build inputs",
        light: images.light,
        dark: images.dark,
        lightImagePath,
        darkImagePath,
        lightTiffPath,
        darkTiffPath,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    light: images.light,
    dark: images.dark,
    cacheDirectory,
    lightImagePath,
    darkImagePath,
    lightTiffPath,
    darkTiffPath,
  };
}

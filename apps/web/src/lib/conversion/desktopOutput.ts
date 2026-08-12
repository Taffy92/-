import { sanitizeLocalPath } from "../batchQueue";
import type { BatchOutputDirectory } from "../batchQueue";

type OutputFile = { blob: Blob; name: string };

type OutputTauriApi = {
  fs?: {
    createDir?: (path: string, options: { recursive: boolean }) => Promise<void>;
    writeBinaryFile?: (options: { path: string; contents: Uint8Array }) => Promise<void>;
  };
};

export async function saveBlobToOutputDirectory(
  blob: Blob,
  name: string,
  destination: BatchOutputDirectory,
  tauri?: OutputTauriApi
) {
  if (destination.kind === "tauri") {
    if (!tauri?.fs?.writeBinaryFile) return "";
    const outputPath = joinOutputPath(destination.path, name);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await tauri.fs.writeBinaryFile({ path: outputPath, contents: bytes });
    return outputPath;
  }

  if (destination.kind === "browser") {
    const safeName = sanitizeWindowsPathSegment(name);
    const fileHandle = await destination.handle.getFileHandle(safeName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return `${destination.label}/${safeName}`;
  }

  return "";
}

export async function saveFilesToOutputDirectory(
  folderName: string,
  files: OutputFile[],
  destination: BatchOutputDirectory,
  tauri?: OutputTauriApi
) {
  if (!files.length) return "";

  if (destination.kind === "tauri") {
    if (!tauri?.fs?.createDir || !tauri?.fs?.writeBinaryFile) return "";
    const folderPath = joinOutputPath(destination.path, folderName);
    await tauri.fs.createDir(folderPath, { recursive: true });
    for (const item of files) {
      const outputPath = joinOutputPath(folderPath, item.name);
      const bytes = new Uint8Array(await item.blob.arrayBuffer());
      await tauri.fs.writeBinaryFile({ path: outputPath, contents: bytes });
    }
    return folderPath;
  }

  if (destination.kind === "browser" && typeof destination.handle?.getDirectoryHandle === "function") {
    const safeFolderName = sanitizeWindowsPathSegment(folderName);
    const directory = await destination.handle.getDirectoryHandle(safeFolderName, { create: true });
    for (const item of files) {
      const fileHandle = await directory.getFileHandle(sanitizeWindowsPathSegment(item.name), { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(item.blob);
      await writable.close();
    }
    return `${destination.label}/${safeFolderName}`;
  }

  return "";
}

export async function createOutputSubdirectory(
  folderName: string,
  destination: BatchOutputDirectory,
  tauri?: OutputTauriApi
): Promise<BatchOutputDirectory | null> {
  if (destination.kind === "tauri") {
    if (!tauri?.fs?.createDir) return null;
    const folderPath = joinOutputPath(destination.path, folderName);
    await tauri.fs.createDir(folderPath, { recursive: true });
    return { kind: "tauri", path: folderPath, label: sanitizeLocalPath(folderPath) };
  }

  if (destination.kind === "browser" && typeof destination.handle?.getDirectoryHandle === "function") {
    const safeFolderName = sanitizeWindowsPathSegment(folderName);
    const handle = await destination.handle.getDirectoryHandle(safeFolderName, { create: true });
    return { kind: "browser", handle, label: `${destination.label}/${safeFolderName}` };
  }

  return null;
}

function joinOutputPath(directory: string, name: string) {
  const separator = directory.includes("\\") ? "\\" : "/";
  return `${directory.replace(/[\\/]+$/, "")}${separator}${sanitizeWindowsPathSegment(name)}`;
}

type DesktopInvoke = (command: string, args: Record<string, string>) => Promise<unknown>;

export type DesktopOutputPlan = Readonly<{
  outputRoot: string;
  temporaryPath: string;
  finalPath: string;
  finalName: string;
}>;

type DesktopOutputPlanOptions = Readonly<{
  outputRoot: string;
  taskId: string;
  requestedName: string;
  existingNames: readonly string[];
}>;

type MultiPageOutputOptions = Readonly<{
  outputRoot: string;
  sourceName: string;
  existingNames: readonly string[];
}>;

export function createDesktopOutputPlan(
  options: DesktopOutputPlanOptions
): DesktopOutputPlan {
  const requestedName = sanitizeFileName(options.requestedName);
  const finalName = resolveUniqueName(requestedName, options.existingNames);
  const safeTaskId = sanitizeNamePart(options.taskId) || "task";
  const temporaryName = `.mrx-task-${safeTaskId}-${finalName}.tmp`;

  return {
    outputRoot: normalizeOutputRoot(options.outputRoot),
    temporaryPath: joinDesktopPath(options.outputRoot, temporaryName),
    finalPath: joinDesktopPath(options.outputRoot, finalName),
    finalName
  };
}

export function createMultiPageOutputDirectory(
  options: MultiPageOutputOptions
) {
  const sourceName = sanitizeFileName(options.sourceName);
  const extensionIndex = sourceName.lastIndexOf(".");
  const requestedDirectory = extensionIndex > 0
    ? sourceName.slice(0, extensionIndex)
    : sourceName;
  const directoryName = resolveUniqueName(requestedDirectory, options.existingNames);
  return {
    directoryName,
    directoryPath: joinDesktopPath(options.outputRoot, directoryName)
  } as const;
}

export function finalizeDesktopOutput(
  invoke: DesktopInvoke,
  plan: DesktopOutputPlan
) {
  return invoke("finalize_task_output", {
    outputRoot: plan.outputRoot,
    temporaryPath: plan.temporaryPath,
    finalName: plan.finalName
  }) as Promise<string>;
}

export function cleanupDesktopTemporaryOutput(
  invoke: DesktopInvoke,
  plan: DesktopOutputPlan
) {
  return invoke("cleanup_task_temporary_file", {
    outputRoot: plan.outputRoot,
    temporaryPath: plan.temporaryPath
  }).then(() => undefined);
}

export function resolveUniqueName(
  requestedName: string,
  existingNames: readonly string[]
) {
  const occupied = new Set(existingNames.map((name) => name.toLocaleLowerCase()));
  if (!occupied.has(requestedName.toLocaleLowerCase())) return requestedName;

  const extensionIndex = requestedName.lastIndexOf(".");
  const hasExtension = extensionIndex > 0;
  const stem = hasExtension ? requestedName.slice(0, extensionIndex) : requestedName;
  const extension = hasExtension ? requestedName.slice(extensionIndex) : "";
  let suffix = 2;
  while (occupied.has(`${stem} (${suffix})${extension}`.toLocaleLowerCase())) suffix += 1;
  return `${stem} (${suffix})${extension}`;
}

function sanitizeFileName(value: string) {
  const cleaned = sanitizeNamePart(value).replace(/^\.+|\.+$/g, "");
  return cleaned || "result.bin";
}

function sanitizeNamePart(value: string) {
  return sanitizeWindowsPathSegment(value);
}

export function sanitizeWindowsPathSegment(value: string) {
  const cleaned = value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .trim()
    .replace(/[. ]+$/g, "");
  const nonEmpty = cleaned === "." || cleaned === ".." || !cleaned ? "_" : cleaned;
  const windowsSafe = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(nonEmpty)
    ? `_${nonEmpty}`
    : nonEmpty;
  return windowsSafe.slice(0, 160).replace(/[. ]+$/g, "") || "_";
}

function joinDesktopPath(root: string, name: string) {
  const normalizedRoot = normalizeOutputRoot(root);
  const separator = normalizedRoot.includes("\\") ? "\\" : "/";
  return normalizedRoot.endsWith(separator)
    ? `${normalizedRoot}${name}`
    : `${normalizedRoot}${separator}${name}`;
}

function normalizeOutputRoot(value: string) {
  const trimmed = value.trim();
  if (/^[A-Za-z]:[\\/]+$/.test(trimmed)) return `${trimmed.slice(0, 2)}\\`;
  if (/^[\\/]+$/.test(trimmed)) return trimmed[0];
  return trimmed.replace(/[\\/]+$/g, "");
}

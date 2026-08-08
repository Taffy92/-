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
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .trim()
    .slice(0, 160);
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

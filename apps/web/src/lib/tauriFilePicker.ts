type TauriFilePickerOptions = {
  accept: string;
  multiple: boolean;
  title: string;
};

export async function pickTauriFiles(
  options: TauriFilePickerOptions
): Promise<File[] | null | undefined> {
  if (typeof window === "undefined") return undefined;
  const tauri = (window as any).__TAURI__;
  if (!tauri?.dialog?.open || !tauri?.fs?.readBinaryFile) return undefined;

  const extensions = Array.from(new Set(
    options.accept
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.startsWith("."))
      .map((value) => value.slice(1).toLowerCase())
  ));
  const selected = await tauri.dialog.open({
    directory: false,
    multiple: options.multiple,
    title: options.title,
    ...(extensions.length ? { filters: [{ name: "支持的本地文件", extensions }] } : {})
  });
  const paths = typeof selected === "string" ? [selected] : Array.isArray(selected) ? selected : [];
  if (!paths.length) return null;

  return Promise.all(paths.map(async (pathValue) => {
    const contents = await tauri.fs.readBinaryFile(pathValue);
    const name = pathValue.split(/[\\/]/).pop() || "local-file";
    const file = new File([new Uint8Array(contents)], name, { type: mimeTypeForName(name) });
    Object.defineProperty(file, "path", { value: pathValue, configurable: false, enumerable: false });
    return file;
  }));
}

function mimeTypeForName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "";
  return ({
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", bmp: "image/bmp",
    gif: "image/gif", pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv",
    mp4: "video/mp4", mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska", webm: "video/webm",
    mp3: "audio/mpeg", wav: "audio/wav", aac: "audio/aac", m4a: "audio/mp4", flac: "audio/flac"
  } as Record<string, string>)[extension] || "application/octet-stream";
}

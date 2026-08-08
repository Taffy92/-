import type { ConversionBackend, ConversionBackendRequest } from "./types";

export function selectConversionBackend(
  request: ConversionBackendRequest
): ConversionBackend {
  if (request.surface === "desktop" && request.family === "office") {
    return "libreoffice";
  }

  if (
    request.surface === "desktop"
    && request.family === "media"
    && request.hasLocalPath
    && request.sidecarReady
  ) {
    return "sidecar";
  }

  return "browser";
}

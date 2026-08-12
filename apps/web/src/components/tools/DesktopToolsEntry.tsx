"use client";

import { lazy } from "react";

const ToolsClient = lazy(() =>
  import("@/components/tools/ToolsClient").then((module) => ({ default: module.ToolsClient }))
);

export function DesktopToolsEntry() {
  return <ToolsClient surface="desktop" />;
}

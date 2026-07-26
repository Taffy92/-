import { licenseAdminApi } from "./_lib/api";

export function onRequestGet(context: { request: Request }): Promise<Response> {
  return licenseAdminApi.backup(context.request);
}

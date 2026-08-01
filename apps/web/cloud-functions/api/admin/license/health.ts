import { licenseAdminApi } from "./_lib/api";

export function onRequestGet(context: { request: Request }): Response {
  return licenseAdminApi.health(context.request);
}

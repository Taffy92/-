import { licenseAdminApi } from "./_lib/api";

export function onRequestGet(): Response {
  return licenseAdminApi.health();
}

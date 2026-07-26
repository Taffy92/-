import { licenseAdminApi } from "../../../../apps/web/cloud-functions/api/admin/license/_lib/api";

export function onRequestGet(): Response {
  return licenseAdminApi.health();
}

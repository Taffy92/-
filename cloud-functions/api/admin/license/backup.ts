import { licenseAdminApi } from "../../../../apps/web/cloud-functions/api/admin/license/_lib/api";

export function onRequestGet(context: {
  request: Request;
}): Promise<Response> {
  return licenseAdminApi.backup(context.request);
}

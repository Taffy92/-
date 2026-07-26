import { licenseAdminApi } from "../../../../apps/web/cloud-functions/api/admin/license/_lib/api";

export function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  return licenseAdminApi.generate(context.request);
}

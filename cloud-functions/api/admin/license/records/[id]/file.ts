import { licenseAdminApi } from "../../../../../../apps/web/cloud-functions/api/admin/license/_lib/api";

export function onRequestGet(context: {
  request: Request;
  params: { id: string };
}): Promise<Response> {
  return licenseAdminApi.downloadFile(context.request, context.params.id);
}

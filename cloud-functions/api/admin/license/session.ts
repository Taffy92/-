import { licenseAdminApi } from "../../../../apps/web/cloud-functions/api/admin/license/_lib/api";

export async function onRequestPost(context: {
  request: Request;
}): Promise<Response> {
  return await licenseAdminApi.createSession(context.request);
}

export function onRequestDelete(context: { request: Request }): Response {
  return licenseAdminApi.deleteSession(context.request);
}

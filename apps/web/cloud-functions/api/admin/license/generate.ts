import { licenseAdminApi } from "./_lib/api";

export function onRequestPost(context: { request: Request }): Promise<Response> {
  return licenseAdminApi.generate(context.request);
}

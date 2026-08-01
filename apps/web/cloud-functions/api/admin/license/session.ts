import { licenseAdminApi } from "./_lib/api";

export function onRequestGet(context: { request: Request }): Response {
  return licenseAdminApi.sessionStatus(context.request);
}

export function onRequestPost(context: { request: Request }): Promise<Response> {
  return licenseAdminApi.createSession(context.request);
}

export function onRequestDelete(context: { request: Request }): Response {
  return licenseAdminApi.deleteSession(context.request);
}

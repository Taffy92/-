import { licenseAdminApi } from "./_lib/api";

type EdgeOneRequestContext = { request: Request } | Request;

export function onRequestGet(context: EdgeOneRequestContext): Response {
  return licenseAdminApi.health(resolveHealthRequest(context));
}

export function resolveHealthRequest(context: EdgeOneRequestContext): Request {
  return "request" in context ? context.request : context;
}

import { licenseAdminApi } from "../../../../apps/web/cloud-functions/api/admin/license/_lib/api";
import { applyRuntimeEnv, type EdgeOneLicenseEnv } from "./_runtime-env";

export async function onRequestPost(context: {
  request: Request;
  env?: EdgeOneLicenseEnv;
}): Promise<Response> {
  applyRuntimeEnv(context.env);
  return await licenseAdminApi.createSession(context.request);
}

export function onRequestDelete(context: {
  request: Request;
  env?: EdgeOneLicenseEnv;
}): Response {
  applyRuntimeEnv(context.env);
  return licenseAdminApi.deleteSession(context.request);
}

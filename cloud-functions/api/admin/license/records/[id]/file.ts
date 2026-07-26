import { licenseAdminApi } from "../../../../../../apps/web/cloud-functions/api/admin/license/_lib/api";
import { applyRuntimeEnv, type EdgeOneLicenseEnv } from "../../_runtime-env";

export function onRequestGet(context: {
  request: Request;
  params: { id: string };
  env?: EdgeOneLicenseEnv;
}): Promise<Response> {
  applyRuntimeEnv(context.env);
  return licenseAdminApi.downloadFile(context.request, context.params.id);
}

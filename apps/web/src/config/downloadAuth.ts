export const downloadAuthConfig = {
  enabled: process.env.NEXT_PUBLIC_DOWNLOAD_AUTH_ENABLED === "true",
  endpoint: process.env.NEXT_PUBLIC_DOWNLOAD_AUTH_ENDPOINT || "",
  contactEmail: "370298218@qq.com"
};

import type { Metadata } from "next";
import { LicenseAdminApp } from "@/components/license-admin/LicenseAdminApp";

export const metadata: Metadata = {
  title: "离线授权后台",
  description: "万能格式转换器离线专业版私有授权后台。",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function LicenseAdminPage() {
  return <LicenseAdminApp />;
}

"use client";

import { useEffect } from "react";
import { installNetworkGuard } from "@/lib/privacy/networkGuard";

export function ClientBoot() {
  useEffect(() => {
    installNetworkGuard();
  }, []);
  return null;
}

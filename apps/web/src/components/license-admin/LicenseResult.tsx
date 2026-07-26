"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import QRCode from "qrcode";
import { downloadLicenseResult } from "@/lib/license-admin/client";
import type { LicenseResult as LicenseResultType } from "@/lib/license-admin/types";
import styles from "./license-admin.module.css";

export function LicenseResult({ result }: { result: LicenseResultType }) {
  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(result.licenseCode, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
      color: { dark: "#0b1020", light: "#ffffff" }
    }).then((value) => {
      if (active) setQrCode(value);
    }).catch(() => {
      if (active) setQrCode("");
    });
    return () => {
      active = false;
    };
  }, [result.licenseCode]);

  async function copyCode() {
    await navigator.clipboard.writeText(result.licenseCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className={`${styles.panel} ${styles.resultPanel}`} aria-labelledby="result-title">
      <div className={styles.successMark} aria-hidden="true"><Check size={18} /></div>
      <p className={styles.eyebrow}>可以发送给客户</p>
      <h2 id="result-title">授权已生成</h2>
      <dl className={styles.resultSummary}>
        <div><dt>客户</dt><dd>{result.customerName}</dd></div>
        <div><dt>机器码</dt><dd>{result.machineCode}</dd></div>
        <div><dt>到期时间</dt><dd>{formatDate(result.expiresAt)}</dd></div>
      </dl>

      <div className={styles.resultActions}>
        <button type="button" className={styles.primaryButton} onClick={copyCode}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "已复制" : "复制授权码"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => downloadLicenseResult(result)}
        >
          <Download size={17} />
          下载 license.mrx
        </button>
      </div>

      <div className={styles.qrWrap}>
        {qrCode ? <img src={qrCode} alt="授权码二维码" /> : <div className={styles.qrLoading}>正在生成二维码</div>}
        <p>客户可扫码复制，也可以直接导入授权文件。</p>
      </div>

      <details className={styles.codeDetails}>
        <summary>查看完整授权码</summary>
        <code>{result.licenseCode}</code>
      </details>
    </section>
  );
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(new Date(timestamp * 1000));
}

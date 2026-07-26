"use client";

import { FormEvent, useState } from "react";
import { Copy, Download, RefreshCw, Search } from "lucide-react";
import { downloadRecordFile } from "@/lib/license-admin/client";
import type { LicenseHistoryItem } from "@/lib/license-admin/types";
import styles from "./license-admin.module.css";

export function LicenseHistory({
  items,
  total,
  loading,
  onSearch,
  onRenew
}: {
  items: LicenseHistoryItem[];
  total: number;
  loading: boolean;
  onSearch: (query: string) => Promise<void>;
  onRenew: (item: LicenseHistoryItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSearch(query);
  }

  async function copy(item: LicenseHistoryItem) {
    await navigator.clipboard.writeText(item.licenseCode);
    setCopiedId(item.recordId);
    window.setTimeout(() => setCopiedId(""), 1600);
  }

  return (
    <section className={styles.panel} aria-labelledby="history-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>共 {total} 条记录</p>
          <h2 id="history-title">授权历史</h2>
        </div>
      </div>
      <form className={styles.searchForm} onSubmit={submit}>
        <label className={styles.srOnly} htmlFor="history-search">搜索客户或机器码</label>
        <input
          id="history-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索客户或机器码"
        />
        <button type="submit" className={styles.iconButton} aria-label="搜索" disabled={loading}>
          <Search size={18} />
        </button>
      </form>

      {loading ? <p className={styles.emptyText}>正在读取记录…</p> : null}
      {!loading && items.length === 0 ? <p className={styles.emptyText}>还没有授权记录。</p> : null}
      <div className={styles.historyList}>
        {items.map((item) => (
          <article className={styles.historyCard} key={item.recordId}>
            <div className={styles.historyTop}>
              <div>
                <h3>{item.customerName}</h3>
                <p>{item.maskedMachineCode}</p>
              </div>
              <span className={item.status === "active" ? styles.activeTag : styles.expiredTag}>
                {item.status === "active" ? "有效期内" : "已到期"}
              </span>
            </div>
            <div className={styles.historyMeta}>
              <span>签发：{formatDate(item.issuedAt)}</span>
              <span>到期：{formatDate(item.expiresAt)}</span>
            </div>
            <div className={styles.historyActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => onRenew(item)}>
                <RefreshCw size={15} />
                续期
              </button>
              <details className={styles.historyDetails}>
                <summary>更多</summary>
                <div>
                  <button type="button" onClick={() => copy(item)}>
                    <Copy size={15} />
                    {copiedId === item.recordId ? "已复制" : "复制授权码"}
                  </button>
                  <button type="button" onClick={() => downloadRecordFile(item.recordId)}>
                    <Download size={15} />
                    下载文件
                  </button>
                  <code>{item.licenseCode}</code>
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    hour12: false,
    timeZone: "Asia/Shanghai"
  }).format(new Date(timestamp * 1000));
}

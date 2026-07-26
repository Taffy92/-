"use client";

import { FormEvent } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  formatMachineCodeInput,
  isCompleteMachineCode
} from "@/lib/license-admin/machine-code";
import type { LicenseDraft, LicenseDuration } from "@/lib/license-admin/types";
import styles from "./license-admin.module.css";

const durations: Array<{ value: LicenseDuration; label: string }> = [
  { value: 30, label: "30 天" },
  { value: 90, label: "90 天" },
  { value: 180, label: "180 天" },
  { value: 365, label: "1 年" },
  { value: "permanent", label: "永久" }
];

export function IssuePanel({
  draft,
  busy,
  error,
  onChange,
  onSubmit,
  onCancelRenewal
}: {
  draft: LicenseDraft;
  busy: boolean;
  error: string;
  onChange: (next: LicenseDraft) => void;
  onSubmit: () => Promise<void>;
  onCancelRenewal: () => void;
}) {
  const renewing = Boolean(draft.parentRecordId);
  const machineReady = renewing || isCompleteMachineCode(draft.machineCode);
  const canSubmit = Boolean(draft.customerName.trim()) && machineReady && !busy;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit();
  }

  return (
    <section className={styles.panel} aria-labelledby="issue-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>{renewing ? "续期模式" : "快速签发"}</p>
          <h2 id="issue-title">生成授权</h2>
        </div>
        {renewing ? (
          <button type="button" className={styles.textButton} onClick={onCancelRenewal}>
            <RotateCcw size={15} />
            取消续期
          </button>
        ) : null}
      </div>

      <form className={styles.issueForm} onSubmit={submit}>
        <label>
          <span>客户名称</span>
          <input
            value={draft.customerName}
            maxLength={40}
            onChange={(event) => onChange({ ...draft, customerName: event.target.value })}
            placeholder="例如：张先生"
            disabled={busy}
          />
        </label>

        <label>
          <span>机器码</span>
          <input
            aria-label="机器码"
            className={styles.machineInput}
            value={renewing ? draft.renewalMachineCode : draft.machineCode}
            onChange={(event) => onChange({
              ...draft,
              machineCode: formatMachineCodeInput(event.target.value)
            })}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            disabled={busy || renewing}
          />
          <small>{renewing ? "将从该设备最近到期时间继续累加。" : "直接粘贴即可，空格和换行会自动整理。"}</small>
        </label>

        <fieldset className={styles.durationFieldset}>
          <legend>授权时长</legend>
          <div className={styles.durationGrid}>
            {durations.map((duration) => (
              <button
                key={duration.label}
                type="button"
                aria-pressed={draft.duration === duration.value}
                className={draft.duration === duration.value
                  ? styles.durationButtonActive
                  : styles.durationButton}
                onClick={() => onChange({ ...draft, duration: duration.value })}
                disabled={busy}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          <span>备注 <em>可选</em></span>
          <textarea
            value={draft.remark}
            maxLength={160}
            rows={3}
            onChange={(event) => onChange({ ...draft, remark: event.target.value })}
            placeholder="例如：首次购买"
            disabled={busy}
          />
        </label>

        {error ? <p className={styles.errorText} role="alert">{error}</p> : null}
        <button type="submit" className={styles.primaryButton} disabled={!canSubmit}>
          <Sparkles size={17} />
          {busy ? "正在生成…" : renewing ? "生成续期授权" : "生成授权码"}
        </button>
      </form>
    </section>
  );
}

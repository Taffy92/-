const MACHINE_CODE_ALPHABET = /^[A-HJ-NP-Z2-9]{16}$/;

export function normalizeMachineCode(value: unknown): string {
  const compact = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");

  if (!MACHINE_CODE_ALPHABET.test(compact)) {
    throw new Error("机器码格式不正确，请使用软件显示的 16 位机器码。");
  }

  return compact.match(/.{4}/g)?.join("-") ?? "";
}

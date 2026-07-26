export function formatMachineCodeInput(value: string): string {
  const compact = value.toUpperCase().replace(/[\s-]+/g, "").slice(0, 16);
  return compact.match(/.{1,4}/g)?.join("-") ?? "";
}

export function isCompleteMachineCode(value: string): boolean {
  return /^[A-HJ-NP-Z2-9]{4}(?:-[A-HJ-NP-Z2-9]{4}){3}$/.test(value);
}

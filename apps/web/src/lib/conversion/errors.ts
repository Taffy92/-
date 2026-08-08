import type {
  ConversionBackend,
  ConversionErrorCode,
  ConversionErrorStage,
  PublicConversionError
} from "./types";

type ConversionFailureOptions = PublicConversionError & { cause?: unknown };

type UnknownErrorContext = Readonly<{
  stage?: ConversionErrorStage;
  backend?: ConversionBackend;
}>;

export class ConversionFailure extends Error {
  readonly code: ConversionErrorCode;
  readonly stage: ConversionErrorStage;
  readonly backend: ConversionBackend;
  readonly action: string;

  constructor(options: ConversionFailureOptions) {
    super(options.message, { cause: options.cause });
    this.name = "ConversionFailure";
    this.code = options.code;
    this.stage = options.stage;
    this.backend = options.backend;
    this.action = options.action;
  }
}

export function toPublicConversionError(
  error: unknown,
  context: UnknownErrorContext = {}
): PublicConversionError {
  if (error instanceof ConversionFailure) {
    return {
      code: error.code,
      stage: error.stage,
      backend: error.backend,
      message: error.message,
      action: error.action
    };
  }

  return {
    code: "unknown",
    stage: context.stage ?? "conversion",
    backend: context.backend ?? "browser",
    message: "转换过程中发生未知错误",
    action: "请重试；如果问题持续，请换用受支持的文件或格式"
  };
}

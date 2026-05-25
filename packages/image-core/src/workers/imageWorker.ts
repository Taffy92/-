import { addTextWatermark, compressImage, resizeImage } from "../image";

self.onmessage = async (event: MessageEvent) => {
  const { id, task, file, options } = event.data;
  try {
    let blob: Blob;
    if (task === "resize") blob = await resizeImage(file, options);
    else if (task === "watermark-text") blob = await addTextWatermark(file, options.watermark, options.format, options.quality, options.custom);
    else if (task === "compress") blob = await compressImage(file, options);
    else throw new Error("不支持的图片处理任务。");
    self.postMessage({ id, ok: true, blob });
  } catch (error) {
    self.postMessage({ id, ok: false, message: error instanceof Error ? error.message : "图片处理失败。" });
  }
};

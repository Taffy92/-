import { describe, expect, it } from "vitest";
import {
  buildAudioConcatArgs,
  buildAudioEnhanceArgs,
  buildGifArgs,
  buildMuteVideoArgs,
  buildTrimArgs,
  validateTrimRange
} from "@doctool/media-core";

describe("media-core quick processing commands", () => {
  it("rejects invalid trim ranges before starting FFmpeg", () => {
    expect(() => validateTrimRange(8, 3, 10)).toThrow("结束时间必须大于开始时间");
    expect(() => validateTrimRange(0, 12, 10)).toThrow("不能超过媒体总时长");
    expect(validateTrimRange(1.25, 4.5, 10)).toEqual({ start: 1.25, end: 4.5 });
  });

  it("builds fast-copy and precise trim commands", () => {
    const fast = buildTrimArgs("input.mp4", "output.mp4", {
      start: 2,
      end: 7,
      kind: "video",
      mode: "fast",
      outputFormat: "mp4"
    });
    const precise = buildTrimArgs("input.mp4", "output.mp4", {
      start: 2,
      end: 7,
      kind: "video",
      mode: "precise",
      outputFormat: "mp4"
    });

    expect(fast).toContain("copy");
    expect(fast).toContain("-ss");
    expect(precise).toContain("mpeg4");
    expect(precise).not.toContain("copy");
  });

  it("builds mute and GIF commands without an audio output track", () => {
    const mute = buildMuteVideoArgs("input.mp4", "output.mp4");
    const gif = buildGifArgs("input.mp4", "output.gif", {
      start: 1,
      end: 4,
      width: 480,
      fps: 12
    });

    expect(mute).toEqual(expect.arrayContaining(["-an", "-c:v", "copy"]));
    expect(gif.join(" ")).toContain("fps=12");
    expect(gif.join(" ")).toContain("scale=480:-2");
  });

  it("keeps audio concat order and applies volume plus fades", () => {
    const concat = buildAudioConcatArgs(["one.mp3", "two.mp3", "three.mp3"], "output.mp3", "mp3");
    const enhanced = buildAudioEnhanceArgs("input.mp3", "output.mp3", {
      format: "mp3",
      volume: 1.4,
      fadeIn: 0.8,
      fadeOut: 1.2,
      duration: 10
    });

    expect(concat.join(" ")).toContain("[0:a:0][1:a:0][2:a:0]concat=n=3:v=0:a=1[outa]");
    expect(enhanced.join(" ")).toContain("volume=1.4");
    expect(enhanced.join(" ")).toContain("afade=t=in:st=0:d=0.8");
    expect(enhanced.join(" ")).toContain("afade=t=out:st=8.8:d=1.2");
  });
});

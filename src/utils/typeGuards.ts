import * as v from "valibot";
import type { SubtitleData } from "@/content/views/types";
import type { FileFormat } from "@/converter/converterFactory";
import type { CaptionTrack } from "@/types/captionTrack";

// Schema for FileFormat
export const FileFormatSchema = v.union([
  v.literal("csv"),
  v.literal("txt"),
  v.literal("srt"),
  v.literal("vtt"),
  v.literal("lrc"),
]);

export const isFileFormat = (value: unknown): value is FileFormat => {
  return v.is(FileFormatSchema, value);
};

// Schema for CaptionTrack
// defined based on src/types/captionTrack.ts
const CaptionTrackSchema = v.object({
  baseUrl: v.string(),
  name: v.object({
    simpleText: v.string(),
  }),
  vssId: v.string(),
  languageCode: v.string(),
  isTranslatable: v.boolean(),
});

export const isCaptionTrack = (value: unknown): value is CaptionTrack => {
  return v.is(CaptionTrackSchema, value);
};

// Schema for SubtitleData
const SubtitleDataSchema = v.object({
  captionTrackList: v.array(CaptionTrackSchema),
  videoId: v.string(),
  videoTitle: v.string(),
  error: v.nullable(v.instance(Error)),
});

export const isSubtitleData = (value: unknown): value is SubtitleData => {
  return v.is(SubtitleDataSchema, value);
};

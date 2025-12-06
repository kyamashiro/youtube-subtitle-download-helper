import he from "he";
import striptags from "striptags";
import type { Timestamp } from "@/timestamp.ts";
import type { Aline } from "@/types/aline.ts";

/**
 * Decompose xml text line by line.
 */
export const decodeAline = (aline: string): Aline => {
  const timestamp: Timestamp = pullTime(aline);
  const htmlText: string = aline
    .replace(/<text.+>/, "")
    .replace(/&amp;/gi, "&")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\r?\n/g, " ");
  const decodedText: string = he.decode(htmlText);
  const text: string = striptags(decodedText);

  return {
    timestamp: timestamp,
    text: text,
  };
};

/**
 * Split lines into by a line.
 */
export const explode = (lines: string): string[] => {
  return lines.split("</text>").filter((line: string) => line?.trim());
};

/**
 * Trim xml tag in first line
 */
export const removeXmlTag = (transcript: string): string => {
  return transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
    .replace("</transcript>", "");
};

/**
 * Pull time from text transcriptListData.
 * <text start="10.159" dur="2.563">
 */
const pullTime = (aline: string): Timestamp => {
  const startRegex = /start="([\d.]+)"/;
  const durRegex = /dur="([\d.]+)"/;
  return {
    start: getTimeFromText(startRegex, aline),
    duration: getTimeFromText(durRegex, aline),
  };
};

/**
 * Execute RegExp.
 */
const getTimeFromText = (regex: RegExp, aline: string): number => {
  const match = regex.exec(aline);
  if (match) {
    const [, time] = match;
    return Number(time);
  }

  return 0;
};

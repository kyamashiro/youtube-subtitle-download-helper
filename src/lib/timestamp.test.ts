import { describe, expect, test } from "vitest";
import type { Timestamp } from "./timestamp";
import {
  formatLrc,
  formatSrt,
  formatVtt,
  getDurationTime,
  getStartTime,
} from "./timestamp";

describe("Get start time.", () => {
  test("Convert 10.159 to 00:00:10.159", () => {
    const timestamp: Timestamp = { start: 10.159, duration: 0 };
    expect(getStartTime(timestamp)).toBe("00:00:10.159");
  });

  test("Convert 100.111 to 00:01:40.111", () => {
    const timestamp: Timestamp = { start: 100.111, duration: 0 };
    expect(getStartTime(timestamp)).toBe("00:01:40.111");
  });

  test("Convert 3600.000 to 01:00:00.000", () => {
    const timestamp: Timestamp = { start: 3600.0, duration: 0 };
    expect(getStartTime(timestamp)).toBe("01:00:00.000");
  });
});

describe("Get duration time", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:25.160", () => {
    const timestamp: Timestamp = { start: 10.159, duration: 15.001 };
    expect(getDurationTime(timestamp)).toBe("00:00:25.160");
  });
});

describe("Get .vtt format timestamp", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:10.159 --> 00:00:25.160", () => {
    const timestamp: Timestamp = { start: 10.159, duration: 15.001 };
    expect(formatVtt(timestamp)).toBe("00:00:10.159 --> 00:00:25.160");
  });
});

describe("Get .srt format timestamp", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:10,159 --> 00:00:25,160", () => {
    const timestamp: Timestamp = { start: 10.159, duration: 15.001 };
    expect(formatSrt(timestamp)).toBe("00:00:10,159 --> 00:00:25,160");
  });
});

describe("Get .lrc format timestamp", () => {
  test("Start time 10.159, the total is converted to 00:10.15", () => {
    const timestamp: Timestamp = { start: 10.159, duration: 15.001 };
    expect(formatLrc(timestamp)).toBe("[00:10.15]");
  });

  test("Start time 7200.159, the total is converted to 120:00.15", () => {
    const timestamp: Timestamp = { start: 7200.159, duration: 15.001 };
    expect(formatLrc(timestamp)).toBe("[120:00.15]");
  });
});

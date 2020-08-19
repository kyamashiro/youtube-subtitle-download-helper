import { Timestamp } from "../timestamp";

describe("Get start time.", () => {
  test("Convert 10.159 to 00:00:10.159", () => {
    const timestamp = new Timestamp(10.159, 0);
    expect(timestamp.getStartTime()).toBe("00:00:10.159");
  });

  test("Convert 100.111 to 00:01:40.111", () => {
    const timestamp = new Timestamp(100.111, 0);
    expect(timestamp.getStartTime()).toBe("00:01:40.111");
  });

  test("Convert 3600.000 to 01:00:00.000", () => {
    const timestamp = new Timestamp(3600.0, 0);
    expect(timestamp.getStartTime()).toBe("01:00:00.000");
  });
});

describe("Get duration time", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:25.160", () => {
    const timestamp = new Timestamp(10.159, 15.001);
    expect(timestamp.getDurationTime()).toBe("00:00:25.160");
  });
});

describe("Get .vtt format timestamp", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:10.159 --> 00:00:25.160\n", () => {
    const timestamp = new Timestamp(10.159, 15.001);
    expect(timestamp.formatVtt()).toBe("00:00:10.159 --> 00:00:25.160\n");
  });
});

describe("Get .srt format timestamp", () => {
  test("Start time 10.159 and duration time 15.001, the total is converted to 00:00:10,159 --> 00:00:25,160\n", () => {
    const timestamp = new Timestamp(10.159, 15.001);
    expect(timestamp.formatSrt()).toBe("00:00:10,159 --> 00:00:25,160\n");
  });
});

describe("Get .lrc format timestamp", () => {
  test("Start time 10.159, the total is converted to 00:10.15", () => {
    const timestamp = new Timestamp(10.159, 15.001);
    expect(timestamp.formatLrc()).toBe("[00:10.15]");
  });

  test("Start time 7200.159, the total is converted to 120:00.15", () => {
    const timestamp = new Timestamp(7200.159, 15.001);
    expect(timestamp.formatLrc()).toBe("[120:00.15]");
  });
});

export default class Timestamp {
  constructor(private start: number, private duration: number) {}

  public getStartTime(): string {
    return this.convertTime(this.start);
  }

  public getDurationTime(): string {
    return this.mergeTime(this.start, this.duration);
  }

  /**
   * Create SRT timestamp format.
   * example: 00:00:00,000 --> 00:00:00,000
   *
   * @returns {string}
   * @memberof Timestamp
   */
  public formatSrt(): string {
    return this.getStartTime().replace(/[.]/, ",") + " --> " + this.getDurationTime().replace(/[.]/, ",") + "\n";
  }

  /**
   * Create VTT timestamp format.
   * example: 00:00:00.000 --> 00:00:00.000
   *
   * @returns {string}
   * @memberof Timestamp
   */
  public formatVtt(): string {
    return this.getStartTime() + " --> " + this.getDurationTime() + "\n";
  }

  /**
   * Create LRC timestamp format.
   * example: [00:00:00.000]
   *
   * @returns {string}
   * @memberof Timestamp
   */
  public formatLrc(): string {
    return `[${this.convertLrcFormatTime(this.start)}]`;
  }

  /**
   * Add start time and duration time
   *
   * @private
   * @param {number} startSeconds
   * @param {number} durationSeconds
   * @returns {string}
   * @memberof Timestamp
   */
  private mergeTime(startSeconds: number, durationSeconds: number): string {
    return new Date(startSeconds * 1000 + durationSeconds * 1000).toISOString().slice(11, -1);
  }

  /**
   * Convert time format from mm.ss to HH:mm:sss.
   * example: 10.159 => 00:00:10.159
   * @private
   * @param {number} seconds
   * @returns {string}
   * @memberof Timestamp
   */
  private convertTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().slice(11, -1);
  }

  /**
   * Convert .lrc time format from mm.ss to mm:ss.
   * example: 10.159 => 00:10.15
   * https://en.wikipedia.org/wiki/LRC_(file_format)
   * @private
   * @param {number} seconds
   * @returns {string}
   * @memberof Timestamp
   */
  private convertLrcFormatTime(seconds: number): string {
    const hh = parseInt(new Date(seconds * 1000).toISOString().slice(12, -11)) * 60;
    const mm = parseInt(new Date(seconds * 1000).toISOString().slice(14, -8));

    if (hh > 0) {
      return `${hh + mm}${new Date(seconds * 1000).toISOString().slice(16, -2)}`;
    }

    return new Date(seconds * 1000).toISOString().slice(14, -2);
  }
}

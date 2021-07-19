export class Timestamp {
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
   * @member Timestamp
   */
  public formatSrt(): string {
    return (
      this.getStartTime().replace(/[.]/, ",") +
      " --> " +
      this.getDurationTime().replace(/[.]/, ",")
    );
  }

  /**
   * Create VTT timestamp format.
   * example: 00:00:00.000 --> 00:00:00.000
   *
   * @returns {string}
   * @member Timestamp
   */
  public formatVtt(): string {
    return this.getStartTime() + " --> " + this.getDurationTime();
  }

  /**
   * Convert .lrc time format from mm.ss to mm:ss.
   * example: 10.159 => [00:10.15]
   * @link https://en.wikipedia.org/wiki/LRC_(file_format)
   * @private
   * @returns {string}
   * @member Timestamp
   */
  public formatLrc(): string {
    const hh =
      parseInt(new Date(this.start * 1000).toISOString().slice(12, -11)) * 60;
    const mm = parseInt(
      new Date(this.start * 1000).toISOString().slice(14, -8)
    );

    if (hh > 0) {
      return `${hh + mm}${new Date(this.start * 1000)
        .toISOString()
        .slice(16, -2)}`;
    }

    return `[${new Date(this.start * 1000).toISOString().slice(14, -2)}]`;
  }

  /**
   * Add start time and duration time
   *
   * @private
   * @param {number} startSeconds
   * @param {number} durationSeconds
   * @returns {string}
   * @member Timestamp
   */
  private mergeTime(startSeconds: number, durationSeconds: number): string {
    return new Date(startSeconds * 1000 + durationSeconds * 1000)
      .toISOString()
      .slice(11, -1);
  }

  /**
   * Convert time format from mm.ss to HH:mm:sss.
   * example: 10.159 => 00:00:10.159
   * @private
   * @param {number} seconds
   * @returns {string}
   * @member Timestamp
   */
  private convertTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().slice(11, -1);
  }
}

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
   */
  public formatSrt(): string {
    return this.getStartTime().replace(/[.]/, ',') + ' --> ' + this.getDurationTime().replace(/[.]/, ',') + '\n';
  }

  /**
   * Create VTT timestamp format.
   * example: 00:00:00.000 --> 00:00:00.000
   */
  public formatVtt(): string {
    return this.getStartTime() + ' --> ' + this.getDurationTime() + '\n';
  }

  /**
   * Add start time and duration time
   */
  private mergeTime(startSeconds: number, durationSeconds: number): string {
    return new Date(startSeconds * 1000 + durationSeconds * 1000).toISOString().slice(11, -1);
  }

  /**
   * Convert time format from mm.ss to HH:mm:sss.
   * example: 10.159 => 00:00:10.159
   */
  private convertTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().slice(11, -1);
  }
}

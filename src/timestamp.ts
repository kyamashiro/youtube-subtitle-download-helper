export interface Timestamp {
  start: number
  duration: number
}

export const getStartTime = (timestamp: Timestamp): string => {
  return convertTime(timestamp.start)
}

export const getDurationTime = (timestamp: Timestamp): string => {
  return mergeTime(timestamp.start, timestamp.duration)
}

/**
 * Create SRT timestamp format.
 * example: 00:00:00,000 --> 00:00:00,000
 */
export const formatSrt = (timestamp: Timestamp): string => {
  return (
    getStartTime(timestamp).replace(/[.]/, ',') +
    ' --> ' +
    getDurationTime(timestamp).replace(/[.]/, ',')
  )
}

/**
 * Create VTT timestamp format.
 * example: 00:00:00.000 --> 00:00:00.000
 */
export const formatVtt = (timestamp: Timestamp): string => {
  return `${getStartTime(timestamp)} --> ${getDurationTime(timestamp)}`
}

/**
 * Convert .lrc time format from mm.ss to mm:ss.
 * example: 10.159 => [00:10.15]
 * @link https://en.wikipedia.org/wiki/LRC_(file_format)
 */
export const formatLrc = (timestamp: Timestamp): string => {
  const hh =
    parseInt(new Date(timestamp.start * 1000).toISOString().slice(12, -11)) * 60
  const mm = parseInt(
    new Date(timestamp.start * 1000).toISOString().slice(14, -8),
  )

  if (hh > 0) {
    return `[${hh + mm}${new Date(timestamp.start * 1000)
      .toISOString()
      .slice(16, -2)}]`
  }

  return `[${new Date(timestamp.start * 1000).toISOString().slice(14, -2)}]`
}

/**
 * Add start time and duration time
 */
const mergeTime = (startSeconds: number, durationSeconds: number): string => {
  return new Date(startSeconds * 1000 + durationSeconds * 1000)
    .toISOString()
    .slice(11, -1)
}

/**
 * Convert time format from mm.ss to HH:mm:sss.
 * example: 10.159 => 00:00:10.159
 */
const convertTime = (seconds: number): string => {
  return new Date(seconds * 1000).toISOString().slice(11, -1)
}

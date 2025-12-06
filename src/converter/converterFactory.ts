import type { Convertable } from './convertable'
import { CsvConverter } from './csvConverter'
import { LrcConverter } from './lrcConverter'
import { SrtConverter } from './srtConverter'
import { TxtConverter } from './txtConverter'
import { VttConverter } from './vttConverter'

export const FileFormat = {
  CSV: 'csv',
  TXT: 'txt',
  SRT: 'srt',
  VTT: 'vtt',
  LRC: 'lrc',
} as const

export type FileFormat = (typeof FileFormat)[keyof typeof FileFormat]

export const createConverter = (fileFormat: FileFormat): Convertable => {
  switch (fileFormat) {
    case FileFormat.CSV:
      return CsvConverter
    case FileFormat.SRT:
      return SrtConverter
    case FileFormat.VTT:
      return VttConverter
    case FileFormat.LRC:
      return LrcConverter
    default:
      return TxtConverter
  }
}

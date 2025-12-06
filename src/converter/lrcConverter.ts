import {
  decodeAline,
  explode,
  removeXmlTag,
} from '../parser/captionsParser'
import { formatLrc } from '../timestamp'
import type { Aline, LrcAline } from '../types/aline'
import { DownloadHelper } from '../utils/downloadHelper'
import type { Convertable } from './convertable'

export const LrcConverter: Convertable = {
  async convert(xmlResponse: string, fileName: string): Promise<void> {
    const lines = this.format(xmlResponse) as LrcAline[]
    const file: string = lines.reduce((acc: string, cur: LrcAline) => {
      return `${acc}${cur.timestamp}${cur.text}\n`
    }, '')

    await DownloadHelper.downloadFile(file, `${fileName}.lrc`, 'text/lrc')
  },

  format(xmlResponse: string): LrcAline[] {
    const trimTranscript: string[] = explode(removeXmlTag(xmlResponse))
    return trimTranscript.map((line: string) => {
      const aline: Aline = decodeAline(line)
      const text: string = aline.text.replace(/\n/, ' ')
      return {
        timestamp: formatLrc(aline.timestamp),
        text: text,
      }
    })
  },
}

import convert from "xml-js";
import { Track } from "../response/track";

export class TranscriptListParser {
  constructor(private response: string) {}

  /**
   * Parse transcript list in XML format
   */
  public parse(): Track[] {
    try {
      const result = convert.xml2js(this.response, {
        compact: true,
        ignoreDeclaration: true,
      }) as TranscriptList;
      console.log(result);

      if (Array.isArray(result.transcript_list.track)) {
        return result.transcript_list.track.map(
          (track: track) =>
            new Track(
              track._attributes.lang_code,
              `${track._attributes.lang_translated}(${track._attributes.lang_original})`
            )
        );
      }

      // Only one list of translations. transcript_list.track's type is not array.
      return [
        new Track(
          result.transcript_list.track._attributes.lang_code,
          `${result.transcript_list.track._attributes.lang_translated}(${result.transcript_list.track._attributes.lang_original})`
        ),
      ];
    } catch (e: any) {
      console.log(e);
      throw new Error("This video has not subtitle");
    }
  }
}

interface TranscriptList {
  transcript_list: {
    track: track[] | track;
  };
}

interface track {
  _attributes: {
    lang_code: string;
    lang_original: string;
    lang_translated: string;
  };
}

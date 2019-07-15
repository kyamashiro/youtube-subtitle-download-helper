import { Timestamp } from "./timestamp";
import { Sentence } from "./sentence";

export class Subtitle {
  constructor(private sentence: Sentence, private timestamp: Timestamp) {}
}

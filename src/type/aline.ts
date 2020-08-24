import { Timestamp } from "../timestamp";

export type Aline = {
  timestamp: Timestamp;
  text: string;
};

export type CsvAline = {
  startTime: string;
  durationTime: string;
  text: string;
};

export type LrcAline = {
  timestamp: string;
  text: string;
};

export type SrtAline = {
  index: string;
  timestamp: string;
  text: string;
};

export type TextAline = {
  text: string;
};

export type VttAline = {
  timestamp: string;
  text: string;
};

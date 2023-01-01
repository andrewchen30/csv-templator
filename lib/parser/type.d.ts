import { SchemaStyle } from './constants';

type RawCell = string;
type RawRow = RawCell[];
type RawTable = RawRow[];

export interface SchemaParser {
  shouldUseParser: (SchemaStyle: SchemaStyle) => boolean;
  parse(raw: string): RawTable;

  // TODO:
  // getDemoTable(data: RawTable): string;
}

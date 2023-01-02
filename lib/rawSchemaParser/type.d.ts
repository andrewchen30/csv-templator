import { SchemaStyle } from './constants';

type RawSchemaCell = string;
type RawSchemaRow = RawSchemaCell[];
type RawSchemaTable = RawSchemaRow[];

export interface SchemaParser {
  shouldUseParser: (SchemaStyle: SchemaStyle) => boolean;
  parse(raw: string): RawSchemaTable;

  // TODO:
  // getDemoTable(data: RawTable): string;
}

import { TableOperator } from '@/utils';
import { ExtensionType } from './const';

export type RawSchemaInputParserInput = {
  raw: string;
  schemaStyle: ExtensionType;
};

export type RawSchemaInputParserOutput = TableOperator<string>;

export interface Extension {
  parse(raw: string): TableOperator<string>;

  // TODO:
  // getDemoTable(data: RawTable): string;
}

import { Schema } from '@/type';
import { TableOperator } from '@/utils';

export type SchemaParserInput = {
  rawSchema: TableOperator<string>;
};

export type SchemaParserOutput = Schema;

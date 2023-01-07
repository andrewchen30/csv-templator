import { TableOperator } from '@/utils';
import { SchemaParserOutput } from '@/schemaParser/type';

export type RendererInput<Data> = {
  schema: SchemaParserOutput;
  data: Data;
};

export type RendererOutput = {
  table: TableOperator<string>;
};

export type RendererCell = {
  eval: string;
  data: {
    [key: string]: any;
  };
};

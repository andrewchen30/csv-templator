import { TableOperator } from '@/utils';
import { SchemaParserOutput } from '@/schemaParser/type';
import { LogicCellType, Schema } from '@/type';

export type RendererInput<Data> = {
  schema: SchemaParserOutput;
  data: Data;
  options?: RenderOptions;
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

export type Renderer = TableOperator<RendererCell>;

export type RenderForLoopInput = {
  data: any;
  schema: Schema;
  renderer: Renderer;
  logicCellType: LogicCellType.forCol | LogicCellType.forRow;
};

export type RenderOptions = {
  defaultValFor_Null?: string;
  defaultValFor_Undefined?: string;
  defaultValFor_NaN?: string;
};

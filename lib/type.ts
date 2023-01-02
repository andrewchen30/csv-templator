type RawTableCell<C = string> = C;
type RawTableRow<C> = RawTableCell<C>[];
export type RawTable<CellType> = RawTableRow<CellType>[];

export enum CellType {
  logic,
  data,
}

export enum LogicCellType {
  forCol,
  forRow,
  extendCol,
  extendRow,
}

export type CellPosition = {
  row: number;
  col: number;
};

export interface BaseCellSchema {
  _positionInTemplate: CellPosition;
}

export interface DataCellSchema extends BaseCellSchema {
  type: CellType.data;
  eval: string | undefined; // TODO: check is pure text
  renderPosition: CellPosition;
}

interface BaseLogicCellSchema extends BaseCellSchema {
  type: CellType.logic;
}

export interface ForeachLogicCellSchema extends BaseLogicCellSchema {
  logicType: LogicCellType.forCol | LogicCellType.forRow;

  // {listName}.foreach(({targetArray}) => ...)
  // for loop target array variable name
  targetArray: string;

  // for loop internal item variable name
  // should be [item] or [item, index]
  loopArgs: string[];
}

export interface ExtendLogicCellSchema extends BaseLogicCellSchema {
  logicType: LogicCellType.extendCol | LogicCellType.extendRow;
  extendFromLoop: CellPosition;
}

export type LogicCellSchema = ForeachLogicCellSchema | ExtendLogicCellSchema;

export type CellSchema = LogicCellSchema | DataCellSchema | null;

export type TemplateSchema = RawTable<CellSchema>;

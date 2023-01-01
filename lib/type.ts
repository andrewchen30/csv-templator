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

export interface BaseCellInfo {
  _positionInTemplate: CellPosition;
}

export interface DataCellInfo extends BaseCellInfo {
  type: CellType.data;
  eval: string | undefined;
  renderPosition: CellPosition;
}

interface BaseLogicCellInfo extends BaseCellInfo {
  type: CellType.logic;
}

export interface ForeachLogicCellInfo extends BaseLogicCellInfo {
  logicType: LogicCellType.forCol | LogicCellType.forRow;

  // {listName}.foreach(({targetArray}) => ...)
  // for loop target array variable name
  targetArray: string;

  // for loop internal item variable name
  // should be [item] or [item, index]
  loopArgs: string[];
}

export interface ExtendLogicCellInfo extends BaseLogicCellInfo {
  logicType: LogicCellType.extendCol | LogicCellType.extendRow;
  extendFromLoop: CellPosition;
}

export type LogicCellInfo = ForeachLogicCellInfo | ExtendLogicCellInfo;

export type CellInfo = LogicCellInfo | DataCellInfo | null;

export interface TemplateParserOutput {
  schema: CellInfo;
}

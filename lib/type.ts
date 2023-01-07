import { TableOperator } from './utils';

type RawTableCell<C = string> = C;
type RawTableRow<C> = RawTableCell<C>[];
export type RawTable<CellType = string> = RawTableRow<CellType>[];

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
  eval: string; // TODO: check is pure text
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
  parentPos: CellPosition;
}

export type LogicCellSchema = ForeachLogicCellSchema | ExtendLogicCellSchema;

export type CellSchema = LogicCellSchema | DataCellSchema | null;

export type Schema = {
  schemaTable: TableOperator<CellSchema>;
  logicRowIndexes: Set<number>;
  logicColIndexes: Set<number>;
};

// #############
// type checker
// #############

export function checkCellIsLogic(cell: CellSchema): cell is LogicCellSchema {
  return cell && cell.type === CellType.logic;
}

export function checkCellIsData(cell: CellSchema): cell is DataCellSchema {
  return cell && cell.type === CellType.data;
}

export function checkCellIsForeachLogic(
  cell: CellSchema,
): cell is ForeachLogicCellSchema {
  if (checkCellIsLogic(cell)) {
    return (
      (cell && cell.logicType === LogicCellType.forCol) ||
      cell.logicType === LogicCellType.forRow
    );
  }
  return false;
}

export function checkCellIsExtendLogic(
  cell: CellSchema,
): cell is ExtendLogicCellSchema {
  if (checkCellIsLogic(cell)) {
    return (
      (cell && cell.logicType === LogicCellType.extendCol) ||
      cell.logicType === LogicCellType.extendRow
    );
  }
  return false;
}

import {
  CellSchema,
  CellPosition,
  checkCellIsExtendLogic,
  checkCellIsForeachLogic,
} from '@/type';
import { TableOperator } from '.';

export function getParentCell(
  table: TableOperator<CellSchema>,
  pos: CellPosition,
): CellSchema {
  const cell = table.getCell(pos);

  if (checkCellIsExtendLogic(cell)) {
    return getParentCell(table, cell.parentPos);
  }

  if (checkCellIsForeachLogic(cell)) {
    return cell;
  }

  return null;
}

export function ingestDataByRow(
  table: TableOperator<any>,
  {
    itemName,
    indexName = '_index',
    rowIdx,
    startFromColIdx,
    colSize,
    value,
    index,
    key = 'data',
  }: {
    itemName: string;
    indexName: string;
    startFromColIdx: number;
    colSize: number;
    rowIdx: number;
    value: any;
    index: number;
    key?: string;
  },
) {
  for (let i = startFromColIdx; i < colSize; i++) {
    table.injectCellByKey({ row: rowIdx, col: i }, key, {
      [itemName]: value,
      [indexName]: index,
    });
  }
}

export function cloneRowByIdx(
  table: TableOperator<any>,
  rowIdx: number,
  cleanUpBeforeColIdx: number,
) {
  const clonedRow = table.getRowByIndex(rowIdx).map((c) => ({ ...c }));

  for (let i = 0; i <= cleanUpBeforeColIdx; i++) {
    clonedRow[i] = null;
  }
  return clonedRow;
}

export function formatCSV(table: TableOperator<string>): string {
  const [row, col] = table.getSize();
  let r = '';

  for (let i = 0; i < row; i++) {
    const row = table.getRowByIndex(i);
    for (let j = 0; j < col; j++) {
      r += row[j];
      if (j !== col - 1) {
        r += ',';
      }
    }
    r += '\n';
  }

  return r;
}

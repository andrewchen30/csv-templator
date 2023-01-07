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

// refactor the ingestDataByRow and ingestDataByCol as one function ingestDataByRowOrCol
export function ingestDataByRowOrCol(
  table: TableOperator<any>,
  {
    itemName,
    indexName = '_index',
    targetIdx,
    startFromIdx = 0,
    size,
    value,
    itemIndex,
    key = 'data',
    isRow,
  }: {
    itemName: string;
    indexName: string;
    startFromIdx: number;
    size: number;
    targetIdx: number;
    value: any;
    itemIndex: number;
    key?: string;
    isRow: boolean;
  },
) {
  for (let i = startFromIdx; i < size; i++) {
    table.injectCellByKey(
      isRow ? { row: targetIdx, col: i } : { row: i, col: targetIdx },
      key,
      {
        [itemName]: value,
        [indexName]: itemIndex,
      },
    );
  }
}

// refactor the cloneRowByIdx and cloneColByIdx as one function cloneRowOrColByIdx
export function cloneRowOrColByIdx({
  table,
  targetIdx,
  startFromIdx,
  isRow,
}: {
  table: TableOperator<any>;
  targetIdx: number;
  startFromIdx: number;
  isRow: boolean;
}) {
  const toCloneRecord = isRow
    ? table.getRowByIndex(targetIdx)
    : table.getColumnByIndex(targetIdx);

  return toCloneRecord.map((c, i) => (i >= startFromIdx ? { ...c } : null));
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

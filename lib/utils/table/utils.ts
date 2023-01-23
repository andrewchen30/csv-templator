import { RendererCell } from '@/renderer/type';
import {
  CellSchema,
  CellPosition,
  checkCellIsExtendLogic,
  checkCellIsForeachLogic,
  Schema,
  DataCellSchema,
  CellType,
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
        [`_${itemName}_index`]: itemIndex,
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

  return toCloneRecord.map((c, i) => {
    if (i < startFromIdx || !c) {
      return null;
    }
    return { ...c };
  });
}

export function formatCSV(
  table: TableOperator<string>,
  schema: Schema,
): string {
  const [row, col] = table.getSize();
  let r = '';

  for (let i = 0; i < row; i++) {
    if (schema.logicRowIndexes.has(i)) {
      continue;
    }

    const row = table.getRowByIndex(i);
    for (let j = 0; j < col; j++) {
      if (schema.logicColIndexes.has(j)) {
        continue;
      }

      r += row[j];
      if (j !== col - 1) {
        r += ',';
      }
    }
    r += '\n';
  }

  return r;
}

export function getNextDataCell(
  table: TableOperator<any>,
  { row, col }: CellPosition,
  isRow: boolean,
): RendererCell {
  const pos = { row, col };

  while (table.inRange(pos)) {
    const cell = table.getCell(pos);

    if (cell && cell.type === CellType.data) {
      return cell;
    }

    if (isRow) {
      pos.col += 1;
    } else {
      pos.row += 1;
    }
  }

  return null;
}

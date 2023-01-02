import { CellPosition, RawTable } from '@/type';

export function initEmptyTable<CellType = null>(
  row: number,
  col: number,
  defaultValue: CellType = null,
): RawTable<CellType> {
  const table: RawTable<CellType> = [];
  for (let i = 0; i < row; i++) {
    const row: CellType[] = [];
    for (let j = 0; j < col; j++) {
      row.push(defaultValue);
    }
    table.push(row);
  }
  return table;
}

export default class TableOperator<CellType> {
  private _rawTable: RawTable<CellType>;

  constructor(rawTable: RawTable<CellType>) {
    this._rawTable = rawTable;
  }

  public getSize(): [number, number] {
    return [this._rawTable.length, this._rawTable[0].length];
  }

  public foreach(exec: (raw: CellType, pos: CellPosition) => void) {
    this._rawTable.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        exec(cell, { row: rowIndex, col: colIndex });
      });
    });
  }

  public updateCell(pos: CellPosition, value: CellType) {
    this._rawTable[pos.row][pos.col] = value;
  }

  public getCell(pos: CellPosition): CellType {
    return this._rawTable[pos.row][pos.col];
  }

  public getRawTable(): RawTable<CellType> {
    return this._rawTable;
  }
}

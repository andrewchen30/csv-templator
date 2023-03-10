import { CellPosition, RawTable } from '@/type';

export * from './utils';

type ScannerCallback<RawType> = (raw: RawType, pos: CellPosition) => void;

function initEmptyTable<CellType = null>(
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

export class TableOperator<CellType> {
  private _rawTable: RawTable<CellType>;

  constructor(rawTable: RawTable<CellType>) {
    this._rawTable = rawTable;
  }

  public getSize(): [number, number] {
    return [this._rawTable.length, this._rawTable[0].length];
  }

  public scan(cb: ScannerCallback<CellType>, ignoreEmptyCell: boolean = true) {
    for (let ri = 0; ri < this._rawTable.length; ri++) {
      const row = this._rawTable[ri];

      for (let ci = 0; ci < row.length; ci++) {
        const cell = this.getCell({ row: ri, col: ci });
        if (ignoreEmptyCell && !cell) {
          continue;
        }
        cb(cell, { row: ri, col: ci });
      }
    }
  }

  public scanByRow(
    cb: ScannerCallback<CellType>,
    ignoreEmptyCell: boolean = true,
  ) {
    this.scan(cb, ignoreEmptyCell);
  }

  public scanByCol(
    cb: ScannerCallback<CellType>,
    ignoreEmptyCell: boolean = true,
  ) {
    const [_, col] = this.getSize();

    for (let ci = 0; ci < col; ci++) {
      for (let ri = 0; ri < this._rawTable.length; ri++) {
        const cell = this.getCell({ row: ri, col: ci });
        if (ignoreEmptyCell && !cell) {
          continue;
        }
        cb(cell, { row: ri, col: ci });
      }
    }
  }

  public scanRowByIndex(
    rowIndex: number,
    cb: ScannerCallback<CellType>,
    ignoreEmptyCell: boolean = true,
  ) {
    this._rawTable[rowIndex].forEach((cell, colIndex) => {
      if (ignoreEmptyCell && !cell) {
        return;
      }
      cb(cell, { row: rowIndex, col: colIndex });
    });
  }

  public scanColByIndex(
    colIndex: number,
    cb: ScannerCallback<CellType>,

    ignoreEmptyCell: boolean = true,
  ) {
    this._rawTable.forEach((row, rowIndex) => {
      const cell = row[colIndex];
      if (ignoreEmptyCell && !cell) {
        return;
      }
      cb(cell, { row: rowIndex, col: colIndex });
    });
  }

  public updateCell(pos: CellPosition, value: CellType) {
    this._rawTable[pos.row][pos.col] = value;
  }

  // skip if cell is null
  public injectCellByKey(pos: CellPosition, key: string, value: any) {
    const prev = this.getCell(pos);
    if (prev) {
      this.updateCell(pos, {
        ...prev,
        [key]: {
          ...prev[key],
          ...value,
        },
      });
    }
  }

  public appendNewRowAfterTheIndex(row: CellType[], index: number): number {
    this._rawTable.splice(
      index + 1,
      0,
      row.map((c) => (c ? { ...c } : null)),
    );

    return index + 1;
  }

  public appendNewColAfterTheIndex(col: CellType[], index: number): number {
    this._rawTable.forEach((row, idx) => {
      row.splice(index + 1, 0, col[idx]);
    });

    return index + 1;
  }

  public removeColByIndex(index: number) {
    this._rawTable.forEach((row) => {
      row.splice(index, 1);
    });
  }

  public removeRowByIndex(index: number) {
    this._rawTable.splice(index, 1);
  }

  public getCell(pos: CellPosition): CellType {
    // null: empty cell
    // undefined: out of range
    return this._rawTable[pos.row]?.[pos.col];
  }

  public getRowByIndex(idx: number): CellType[] {
    return this._rawTable[idx];
  }

  public getColumnByIndex(idx: number): CellType[] {
    return this._rawTable.map((row) => row[idx]);
  }

  public getRawTable(): RawTable<CellType> {
    return this._rawTable;
  }

  public initSameSizeEmptyTable<T>(): TableOperator<T> {
    const [row, col] = this.getSize();
    return new TableOperator(initEmptyTable(row, col));
  }

  public toArray() {
    return this._rawTable.map((row) => row.map((c) => c));
  }

  public inRange(pos: CellPosition): boolean {
    const [row, col] = this.getSize();
    return pos.row >= 0 && pos.row < row && pos.col >= 0 && pos.col < col;
  }
}

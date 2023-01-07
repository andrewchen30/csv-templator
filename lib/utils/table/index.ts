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
    this._rawTable.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (ignoreEmptyCell && !cell) {
          return;
        }
        cb(cell, { row: rowIndex, col: colIndex });
      });
    });
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
    const [row, col] = this.getSize();
    for (let i = 0; i < col; i++) {
      for (let j = 0; j < row; j++) {
        const cell = this.getCell({ row: j, col: i });
        if (ignoreEmptyCell && !cell) {
          continue;
        }
        cb(cell, { row: j, col: i });
      }
    }
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

  public pushNewRow(row: CellType[]): number {
    // TODO: fix unnecessary copy here, it should be controlled by the caller
    this._rawTable.push(row.map((c) => (c ? { ...c } : null)));

    return this._rawTable.length - 1;
  }

  public pushNewCol(col: CellType[]): number {
    this._rawTable.forEach((row, idx) => {
      row.push(col[idx]);
    });

    return this._rawTable[0].length - 1;
  }

  public getCell(pos: CellPosition): CellType {
    // null: empty cell
    // undefined: out of range
    return this._rawTable[pos.row]?.[pos.col];
  }

  public getRowByIndex(idx: number): CellType[] {
    return this._rawTable[idx];
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
}

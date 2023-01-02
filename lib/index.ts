import {
  RawTable,
  CellSchema,
  LogicCellType,
  checkCellIsData,
  CellType,
  checkCellIsForeachLogic,
  checkCellIsExtendLogic,
  ForeachLogicCellSchema,
} from '@/type';
import ExtensionByStyle from './extensions';
import { Option, formatOption } from './option';
import {
  cloneRowByIdx,
  getParentCell,
  ingestDataByRow,
  TableOperator,
} from './utils';
import { checkIsLogicCell, parseLogicCellSchema } from './parser/logicCell';
import { parseDataCellSchema } from './parser/dataCell';

type RawValue = {
  eval: string;
  data: {
    [key: string]: any;
  };
};

type RawValueTable = TableOperator<RawValue>;

export default class CSVTemplator<Data = any> {
  _option: Option;
  _rawTemplate: string;
  _rawTable: RawTable;
  _rawValue: RawValueTable;
  _schema: TableOperator<CellSchema>;
  _logicRowIndexes: Set<number>;
  _logicColIndexes: Set<number>;

  constructor(option: Option = {}) {
    this._option = formatOption(option);
  }

  public render(data: Data): Buffer {
    // TODO: generate data validator from this._schema

    // allocate data and eval renderer to each cell
    this._rawValue = this._prepareRawValue(data);

    return Buffer.from('', 'utf-8');
  }

  private _prepareRawValue(data: Data) {
    const rawValue = this._schema.initSameSizeEmptyTable<RawValue>();
    const [rowSize, colSize] = rawValue.getSize();

    // ingest data into pure data cell
    this._schema.scan((cell, pos) => {
      if (checkCellIsData(cell)) {
        rawValue.updateCell(pos, { data, eval: cell.eval });
      }
    });

    let cloningRows = [];
    let baseForRowCell: ForeachLogicCellSchema;

    // ingest data into for-row logic row
    this._schema.scanByCol((cell, pos) => {
      if (!this._logicColIndexes.has(pos.col)) {
        return;
      }

      const ingestCurrentRowAndPrepareToClone = () => {
        const { targetArray, loopArgs } = baseForRowCell;
        const [itemName, indexName] = loopArgs;

        ingestDataByRow(rawValue, {
          colSize,
          itemName,
          indexName,
          index: 0,
          rowIdx: pos.row,
          startFromColIdx: pos.col + 1,
          value: data[targetArray][0],
        });
        cloningRows.push(cloneRowByIdx(rawValue, pos.row, pos.col));
      };

      const isLastRow = pos.row === rowSize - 1;

      if (checkCellIsForeachLogic(cell)) {
        baseForRowCell = cell;
        ingestCurrentRowAndPrepareToClone();
        if (!isLastRow) {
          return;
        }
      }

      if (
        checkCellIsExtendLogic(cell) &&
        getParentCell(this._schema, cell.parentPos)
      ) {
        ingestCurrentRowAndPrepareToClone();

        if (!isLastRow) {
          return;
        }
      }

      if (baseForRowCell) {
        const { targetArray, loopArgs } = baseForRowCell;
        const [itemName, indexName] = loopArgs;

        for (let i = 1; i < data[targetArray].length; i++) {
          const value = data[targetArray][i];

          cloningRows.forEach((cloningRow) => {
            const newRowIdx = rawValue.pushNewRow(cloningRow);

            ingestDataByRow(rawValue, {
              colSize,
              itemName,
              indexName,
              value,
              index: i,
              rowIdx: newRowIdx,
              startFromColIdx: pos.col + 1,
            });
          });
        }
      }

      // clean up
      cloningRows = [];
      baseForRowCell = null;
    });

    return rawValue;
  }

  public useTemplate(template: string) {
    // re-initial properties
    this._logicColIndexes = new Set();
    this._logicRowIndexes = new Set();

    const rawTable = this._getExtension().parse(template);

    // validate rawTable, directly throw error if invalid
    this._validateRawTable(this._rawTable);

    // parse rawTable to schema
    const schema = this._parseTemplateToSchema(rawTable);

    // backup variables
    this._schema = schema;
    this._rawTable = rawTable;
    this._rawTemplate = template;
  }

  private _getExtension() {
    const { schemaStyle } = this._option;
    return ExtensionByStyle[schemaStyle];
  }

  private _validateRawTable(rawTable: RawTable): boolean {
    // TODO: validate rawTable
    return true;
  }

  private _parseTemplateToSchema(rawTable: RawTable) {
    const raw = new TableOperator<string>(rawTable);
    const schema = raw.initSameSizeEmptyTable<CellSchema>();

    raw.scan((raw, pos) => {
      const cellInfo = {
        raw,
        pos,
      };

      if (!raw) {
        return;
      }

      // parse data cell
      if (!checkIsLogicCell(raw)) {
        schema.updateCell(pos, parseDataCellSchema(cellInfo));
        return;
      }

      // parse logic cell
      const logicCellSchema = parseLogicCellSchema(cellInfo);
      schema.updateCell(pos, logicCellSchema);

      // mark logic row and col
      if (
        logicCellSchema.logicType === LogicCellType.forRow ||
        logicCellSchema.logicType === LogicCellType.forCol
      ) {
        this._logicColIndexes.add(pos.col);
        this._logicRowIndexes.add(pos.row);
      }

      // validate parent logic cell exists
      if (
        logicCellSchema.logicType === LogicCellType.extendCol ||
        logicCellSchema.logicType === LogicCellType.extendRow
      ) {
        const parentCell = schema.getCell(logicCellSchema.parentPos);

        if (!parentCell) {
          throw new Error("Extend logic cell's parent is not exists");
        }
      }
    });

    return schema;
  }
}

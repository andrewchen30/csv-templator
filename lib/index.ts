import ExtensionByStyle from './extensions';
import { CellSchema, LogicCellType, TemplateSchema } from './type';
import { RawTable } from './extensions/type';
import { Option, formatOption } from './option';
import TableOperator, { initEmptyTable } from './utils/table';
import {
  checkIsLogicCell,
  parseLogicCellSchema,
} from './schemaParser/logicCell';
import { parseDataCellSchema } from './schemaParser/dataCell';

export default class CSVTemplator<Data> {
  private _option: Option;
  private _rawTemplate: string;
  private _rawTable: RawTable;
  private _schema: TemplateSchema;
  private _logicRowIndexes: Set<number>;
  private _logicColIndexes: Set<number>;

  constructor(option: Option) {
    this._option = formatOption(option);
  }

  public render(data: Data): Buffer {
    // TODO:
    return Buffer.from('', 'utf-8');
  }

  public useTemplate(template: string) {
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

  private _parseTemplateToSchema(rawTable: RawTable<string>): TemplateSchema {
    const raw = new TableOperator<string>(rawTable);
    const { row, col } = rawTable.getSize();

    const schema = new TableOperator<CellSchema>(initEmptyTable(row, col));

    raw.foreach((raw, pos) => {
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
      if (logicCellSchema.logicType === LogicCellType.forRow) {
        this._logicColIndexes.add(pos.col);
      } else if (logicCellSchema.logicType === LogicCellType.forCol) {
        this._logicRowIndexes.add(pos.row);
      }
    });

    return schema.getRawTable();
  }
}

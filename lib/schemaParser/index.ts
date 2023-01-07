import { CellSchema, LogicCellType } from '@/type';
import { parseDataCellSchema } from './dataCell';
import { checkIsLogicCell, parseLogicCellSchema } from './logicCell';
import { SchemaParserInput, SchemaParserOutput } from './type';

export function validateSchema(input: SchemaParserInput): boolean {
  // TODO: validate rawTable

  return true;
}

export function parseSchema(input: SchemaParserInput): SchemaParserOutput {
  const { rawSchema } = input;
  const schema = rawSchema.initSameSizeEmptyTable<CellSchema>();
  const logicColIndexes = new Set<number>();
  const logicRowIndexes = new Set<number>();

  rawSchema.scan((raw, pos) => {
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
      logicColIndexes.add(pos.col);
      logicRowIndexes.add(pos.row);
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

  return {
    schemaTable: schema,
    logicColIndexes,
    logicRowIndexes,
  };
}

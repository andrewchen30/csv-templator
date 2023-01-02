import { CellPosition, DataCellSchema, CellType } from '@/type';

function getRenderPosition(posInTemplate: CellPosition, offset: CellPosition) {
  return {
    row: posInTemplate.row - offset.row,
    col: posInTemplate.col - offset.col,
  };
}

type GetDataCellSchemaInput = {
  pos: CellPosition;
  raw: string;
};

export function parseDataCellSchema({
  pos,
  raw,
}: GetDataCellSchemaInput): DataCellSchema {
  return {
    type: CellType.data,
    eval: raw,
    renderPosition: pos, // not correct
    _positionInTemplate: pos,
  };
}

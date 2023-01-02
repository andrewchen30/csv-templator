import { getErrorMsgWithPos } from '@/utils';
import { LogicCellCtrl, LogicTypeByCommand } from '@/const';
import { CellPosition, CellType, LogicCellSchema, LogicCellType } from '@/type';

export function checkIsLogicCell(raw: string): boolean {
  return raw.startsWith(LogicCellCtrl.left);
}

export type GetLogicCellSchemaInput = {
  raw: string;
  pos: CellPosition;
};

export function parseLogicCellSchema({
  raw,
  pos,
}: GetLogicCellSchemaInput): LogicCellSchema {
  // double check
  if (!checkIsLogicCell(raw)) {
    throw new Error('Invalid logic cell');
  }

  const [prefix, command, ...commandArgs] = raw.split(' ').filter(Boolean);
  const logicType = LogicTypeByCommand[command];

  switch (logicType) {
    // command: for-col, for-row
    // commandArgs: [sh, i] in po.shipment
    case LogicCellType.forRow:
    case LogicCellType.forCol: {
      const [loopArgs, _forLoopPair, targetArray] = commandArgs;

      if (_forLoopPair !== 'in') {
        throw new Error(
          getErrorMsgWithPos(`Invalid logic command for-${_forLoopPair}`, pos),
        );
      }

      return {
        targetArray,
        type: CellType.logic,
        loopArgs: Array.isArray(loopArgs) ? loopArgs : [loopArgs],
        logicType:
          logicType === LogicCellType.forCol
            ? LogicCellType.forCol
            : LogicCellType.forRow,
        _positionInTemplate: pos,
      };
    }
    // command: extend-col, extend-row
    // commandArgs: (no args)
    case LogicCellType.extendRow:
    case LogicCellType.extendCol: {
      return {
        type: CellType.logic,
        logicType:
          logicType === LogicCellType.extendCol
            ? LogicCellType.extendCol
            : LogicCellType.extendRow,
        extendFromLoop:
          logicType === LogicCellType.extendCol
            ? {
                row: pos.row,
                col: pos.col - 1,
              }
            : {
                row: pos.row - 1,
                col: pos.col,
              },
        _positionInTemplate: pos,
      };
    }
    default:
      throw new Error(
        getErrorMsgWithPos(`Invalid logic command ${command}`, pos),
      );
  }
}

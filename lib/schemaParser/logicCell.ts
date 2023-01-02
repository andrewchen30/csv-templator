import { getErrorMsgWithPos } from '@/utils';
import { LogicCellCtrl, LogicTypeByCommand } from '@/const';
import { CellPosition, CellType, LogicCellInfo, LogicCellType } from '@/type';

export function isLogicCell(raw: string): boolean {
  return raw.startsWith(LogicCellCtrl.left);
}

export type GetLogicCellInfoInput = {
  raw: string;
  pos: CellPosition;
  parentLogicPos?: CellPosition;
};

export function parseLogicCellInfo({
  raw,
  pos,
  parentLogicPos,
}: GetLogicCellInfoInput): LogicCellInfo {
  // double check
  if (!isLogicCell(raw)) {
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
      if (!parentLogicPos) {
        throw new Error(
          getErrorMsgWithPos(
            'Command extend must be dependent on a loop command',
            pos,
          ),
        );
      }

      return {
        type: CellType.logic,
        logicType:
          logicType === LogicCellType.extendCol
            ? LogicCellType.extendCol
            : LogicCellType.extendRow,
        extendFromLoop: parentLogicPos,
        _positionInTemplate: pos,
      };
    }
    default:
      throw new Error(
        getErrorMsgWithPos(`Invalid logic command ${command}`, pos),
      );
  }
}

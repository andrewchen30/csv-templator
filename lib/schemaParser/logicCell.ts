import { getErrorMsgWithPos } from '@/utils';
import { LogicCellCtrl, LogicTypeByCommand } from '@/const';
import { CellPosition, CellType, LogicCellSchema, LogicCellType } from '@/type';

export function checkIsLogicCell(raw: string): boolean {
  if (raw.startsWith(LogicCellCtrl.left) && raw.endsWith(LogicCellCtrl.right)) {
    return true;
  }

  if (raw.startsWith(LogicCellCtrl.left)) {
    throw new Error('Invalid logic cell: missing right ctrl');
  }

  return false;
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
      const [loopArgs, _forLoopPair, targetArray, suffix] = commandArgs;

      if (_forLoopPair !== 'in') {
        throw new Error(
          getErrorMsgWithPos(`Invalid logic command for-${_forLoopPair}`, pos),
        );
      }

      return {
        logicType,
        targetArray,
        type: CellType.logic,
        loopArgs: Array.isArray(loopArgs) ? loopArgs : [loopArgs],
        _positionInTemplate: pos,
      };
    }
    // command: extend-col, extend-row
    // commandArgs: (no args)
    case LogicCellType.extendRow:
    case LogicCellType.extendCol: {
      return {
        logicType,
        type: CellType.logic,
        parentPos:
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
    // command: visible-col, visible-row
    // commandArgs: eval script string
    case LogicCellType.visibleRow:
    case LogicCellType.visibleCol: {
      if (logicType === LogicCellType.visibleCol && pos.row !== 0) {
        throw new Error(
          getErrorMsgWithPos(
            `Invalid logic command visible-col, should be in first row`,
            pos,
          ),
        );
      }

      if (logicType === LogicCellType.visibleRow && pos.col !== 0) {
        throw new Error(
          getErrorMsgWithPos(
            `Invalid logic command visible-row, should be in first col`,
            pos,
          ),
        );
      }

      commandArgs.pop();
      const evalScriptStr = commandArgs.join(' ');

      return {
        logicType,
        type: CellType.logic,
        eval: evalScriptStr,
        _positionInTemplate: pos,
      };
    }
    default:
      throw new Error(
        getErrorMsgWithPos(`Invalid logic command ${command}`, pos),
      );
  }
}

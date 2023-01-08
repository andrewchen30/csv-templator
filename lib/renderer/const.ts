import { LogicCellType } from '@/type';

export const ForLoopRendererConfig = {
  [LogicCellType.forRow]: {
    scanner: 'scanByCol',
    logicIndexes: 'logicColIndexes',
    extendLogic: LogicCellType.extendRow,
  },

  [LogicCellType.forCol]: {
    scanner: 'scanByRow',
    logicIndexes: 'logicRowIndexes',
    extendLogic: LogicCellType.extendCol,
  },
} as const;

export const ForLoopLogicTypes = [
  LogicCellType.forRow,
  LogicCellType.forCol,
] as const;

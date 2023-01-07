import { LogicCellType } from '@/type';

export const ForLoopRendererConfig = {
  [LogicCellType.forRow]: {
    scanner: 'scanByCol' as const,
    logicIndexes: 'logicColIndexes' as const,
    extendLogic: LogicCellType.extendRow,
  },

  [LogicCellType.forCol]: {
    scanner: 'scanByRow' as const,
    logicIndexes: 'logicRowIndexes' as const,
    extendLogic: LogicCellType.extendCol,
  },
};

export const ForLoopLogicTypes = [
  LogicCellType.forRow,
  LogicCellType.forCol,
] as const;

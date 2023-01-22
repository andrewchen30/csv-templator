import { LogicCellType } from './type';

export const LogicCellCtrl = {
  // always follow by a space, so that we can split by space
  left: '%',
  right: '%',
};

export const LogicCommandByType: { [command in LogicCellType]: string } = {
  [LogicCellType.forCol]: 'for-col',
  [LogicCellType.forRow]: 'for-row',
  [LogicCellType.extendCol]: 'extend-col',
  [LogicCellType.extendRow]: 'extend-row',
};

export const LogicTypeByCommand: { [command: string]: LogicCellType } =
  Object.entries(LogicCommandByType).reduce(
    (m, [t, c]) => ({
      ...m,
      [c]: parseInt(t, 10),
    }),
    {},
  );

import { CellPosition } from '@/type';

export function getErrorMsgWithPos(msg: string, pos: CellPosition): string {
  return `[${pos.row}, ${pos.col}] ${msg}`;
}

// import { isLogicCell } from './logic/parser';
// import {
//   CellType,
//   CellInfo,
//   CellPosition,
//   DataCellInfo,
//   LogicCellInfo,
// } from './type';

// function getBaseLogicCellInfo(
//   pos: CellPosition,
// ): Omit<LogicCellInfo, 'logicType'> {
//   return {
//     type: CellType.logic,
//     _positionInTemplate: pos,
//   };
// }

// function getBaseDataCellInfo(
//   pos: CellPosition,
//   posOffset: CellPosition,
// ): DataCellInfo {
//   return {
//     type: CellType.data,
//     eval: undefined,
//     renderPosition: getRenderPosition(pos, posOffset),
//     _positionInTemplate: pos,
//   };
// }

// function getRenderPosition(posInTemplate: CellPosition, offset: CellPosition) {
//   return {
//     row: posInTemplate.row - offset.row,
//     col: posInTemplate.col - offset.col,
//   };
// }

// type ParseCellInfoInput = {
//   raw: string;
//   currentPosition: CellPosition;
//   logicOffset: CellPosition;
// };

// export function parseCellInfo({
//   raw,
//   currentPosition,
//   logicOffset,
// }: ParseCellInfoInput): CellInfo {
//   const isNotEmpty = raw !== '';

//   if (!raw) {
//     return null;
//   }

//   if (isLogicCell(raw)) {
//     // TODO:
//   }

//   return {
//     ...getBaseDataCellInfo(currentPosition, logicOffset),
//     eval: raw,
//   };
// }

import {
  getParentCell,
  ingestDataByRowOrCol,
  cloneRowOrColByIdx,
  TableOperator,
  getNextDataCell,
} from '@/utils';
import {
  checkCellIsData,
  checkCellIsForeachLogic,
  checkCellIsExtendLogic,
  LogicCellType,
  ForeachLogicCellSchema,
  CellPosition,
  CellType,
  DataCellSchema,
} from '@/type';
import {
  Renderer,
  RendererInput,
  RendererOutput,
  RenderForLoopInput,
  RenderOptions,
} from './type';
import { eval_exposeObjectAllKeys } from './eval';
import { ForLoopLogicTypes, ForLoopRendererConfig } from './const';
import { getValueByPath } from '@/utils/objectUtils';

export function render<Data>(input: RendererInput<Data>): RendererOutput {
  const renderer = prepareRenderer<Data>(input);

  return {
    table: renderOutput(renderer, input.options),
  };
}

function renderOutput(
  renderer: Renderer,
  options: RenderOptions,
): TableOperator<string> {
  const output = renderer.initSameSizeEmptyTable<string>();

  renderer.scan((cell, pos) => {
    if (cell?.type === CellType.data) {
      output.updateCell(pos, renderOutputCell(cell, pos, options));
    }
  }, false);

  return output;
}

export function renderOutputCell(
  cell: DataCellSchema,
  pos: CellPosition,
  options: RenderOptions = {},
) {
  const {
    defaultValFor_NaN = '',
    defaultValFor_Null = '-',
    defaultValFor_Undefined = '',
  } = options;

  // when raw value is empty, just make an empty cell
  if (!cell || Object.keys(cell).length === 0 || !cell.eval) {
    return defaultValFor_Undefined;
  }

  const body = `
      ${cell.data ? eval_exposeObjectAllKeys(cell.data) : ''}

      return ${cell.eval};
    `;

  try {
    const r = Function.apply(null, ['data', body])(cell.data);

    if (r === null) {
      return defaultValFor_Null;
    }

    if (Number.isNaN(r)) {
      return defaultValFor_NaN;
    }

    if (r === undefined) {
      return defaultValFor_Undefined;
    }

    return r.toString();
  } catch (error) {
    console.error('Failed to render cell at', pos, 'with error:', error, body);

    // TODO: enhance error handling
    if (error.message.includes(' is not defined')) {
      return defaultValFor_Undefined;
    }

    throw new Error(`Error at [${pos.row}, ${pos.col}]: ${error.message}`);
  }
}

function prepareRenderer<Data>(input: RendererInput<Data>) {
  const { schema, data } = input;
  const { schemaTable } = schema;

  const getVisibility = (evalScript: string) => {
    return Boolean(
      Function.apply(null, [
        'data',
        `${data ? eval_exposeObjectAllKeys(data) : ''};

        return ${evalScript};`,
      ])(data),
    );
  };

  // remove invisible column
  schemaTable.scanRowByIndex(0, (cell, { col }) => {
    if (
      cell.type === CellType.logic &&
      cell.logicType === LogicCellType.visibleCol &&
      !getVisibility(cell.eval)
    ) {
      schemaTable.removeColByIndex(col);
    }
  });

  // remove invisible row
  schemaTable.scanColByIndex(0, (cell, { row }) => {
    if (
      cell.type === CellType.logic &&
      cell.logicType === LogicCellType.visibleRow &&
      !getVisibility(cell.eval)
    ) {
      schemaTable.removeRowByIndex(row);
    }
  });

  // ingest data into pure data cell
  schemaTable.scan((cell, pos) => {
    if (checkCellIsData(cell)) {
      schemaTable.injectCellByKey(pos, 'data', data);
    }
  });

  ForLoopLogicTypes.forEach((logicCellType) => {
    renderForLoop({
      data,
      schema,
      logicCellType,
    });
  });

  return schemaTable;
}

function renderForLoop(input: RenderForLoopInput) {
  const { schema, data, logicCellType } = input;

  const config = ForLoopRendererConfig[logicCellType];
  const { [config.logicIndexes]: logicIndexes, schemaTable } = schema;
  const [rowSize, colSize] = schemaTable.getSize();

  let toCloneRecords = [];
  let baseSchema: ForeachLogicCellSchema;

  schemaTable[config.scanner]((cell, pos) => {
    const isRow = logicCellType === LogicCellType.forRow;

    // skip non-logic cell
    if (!logicIndexes.has(isRow ? pos.col : pos.row)) {
      return;
    }

    const nextCell = getNextDataCell(schemaTable, pos, isRow);

    const prepareToClone = () => {
      const { targetArrayPath, loopArgs } = baseSchema;
      const [itemName, indexName] = loopArgs;

      const value =
        getValueByPath(nextCell?.data ?? data, targetArrayPath, [])[0] ?? null;

      ingestDataByRowOrCol(schemaTable, {
        isRow,
        itemName,
        indexName,
        itemIndex: 0,
        value,
        ...(isRow
          ? {
              targetIdx: pos.row,
              startFromIdx: pos.col + 1,
              size: colSize,
            }
          : {
              targetIdx: pos.col,
              startFromIdx: pos.row + 1,
              size: rowSize,
            }),
      });

      toCloneRecords.push(
        cloneRowOrColByIdx({
          isRow,
          table: schemaTable,
          ...(isRow
            ? {
                // skip current cell since it's logic cell should not be cloned
                startFromIdx: pos.col + 1,
                targetIdx: pos.row,
              }
            : {
                // skip current cell since it's logic cell should not be cloned
                startFromIdx: pos.row + 1,
                targetIdx: pos.col,
              }),
        }),
      );
    };

    const isEndOfForLoop =
      (
        schemaTable.getCell(
          isRow
            ? { row: pos.row + 1, col: pos.col }
            : { row: pos.row, col: pos.col + 1 },
        ) as any
      )?.logicType !== config.extendLogic;

    if (checkCellIsForeachLogic(cell) && cell.logicType === logicCellType) {
      baseSchema = cell;
      prepareToClone();
      if (!isEndOfForLoop) {
        return;
      }
    }

    // if the follow cell is extend logic, we keep this row/col as as toCloneRecord
    if (
      checkCellIsExtendLogic(cell) &&
      cell.logicType === config.extendLogic &&
      getParentCell(schemaTable, cell.parentPos)
    ) {
      prepareToClone();

      if (!isEndOfForLoop) {
        return;
      }
    }

    if (baseSchema && toCloneRecords.length > 0) {
      const { targetArrayPath, loopArgs } = baseSchema;
      const [itemName, indexName] = loopArgs;

      let appendAfterIndex = isRow ? pos.row : pos.col;

      const targetArray = getValueByPath(
        nextCell?.data ?? data,
        targetArrayPath,
        [],
      );

      for (let i = 1; i < targetArray.length; i++) {
        const value = targetArray[i];

        toCloneRecords.forEach((toCloneRecord) => {
          const targetIdx = isRow
            ? schemaTable.appendNewRowAfterTheIndex(
                toCloneRecord,
                appendAfterIndex,
              )
            : schemaTable.appendNewColAfterTheIndex(
                toCloneRecord,
                appendAfterIndex,
              );

          ingestDataByRowOrCol(schemaTable, {
            isRow,
            value,
            itemName,
            indexName,
            targetIdx,
            itemIndex: i,
            ...(isRow
              ? {
                  size: colSize,
                  startFromIdx: pos.col + 1,
                }
              : {
                  size: rowSize,
                  startFromIdx: pos.row + 1,
                }),
          });

          appendAfterIndex += 1;
        });
      }

      // clean up after insert all toCloneRecords
      baseSchema = null;
      toCloneRecords = [];
    }
  });
}

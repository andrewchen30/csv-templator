import {
  getParentCell,
  ingestDataByRowOrCol,
  cloneRowOrColByIdx,
  TableOperator,
} from '@/utils';
import {
  checkCellIsData,
  checkCellIsForeachLogic,
  checkCellIsExtendLogic,
  LogicCellType,
  ForeachLogicCellSchema,
  CellPosition,
} from '@/type';
import {
  Renderer,
  RendererCell,
  RendererInput,
  RendererOutput,
  RenderForLoopInput,
  RenderOptions,
} from './type';
import { eval_exposeObjectAllKeys } from './eval';
import { ForLoopLogicTypes, ForLoopRendererConfig } from './const';

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
    output.updateCell(pos, renderOutputCell(cell, pos, options));
  }, false);

  return output;
}

export function renderOutputCell(
  cell: RendererCell,
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
      // eval function at [${pos.row},${pos.col}]
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
  const renderer = schemaTable.initSameSizeEmptyTable<RendererCell>();

  // ingest data into pure data cell
  schemaTable.scan((cell, pos) => {
    if (checkCellIsData(cell)) {
      renderer.updateCell(pos, { data, eval: cell.eval });
    }
  });

  ForLoopLogicTypes.forEach((logicCellType) => {
    renderForLoop({
      data,
      schema,
      renderer,
      logicCellType,
    });
  });

  return renderer;
}

function renderForLoop(input: RenderForLoopInput) {
  const { schema, renderer, data, logicCellType } = input;
  const [rowSize, colSize] = renderer.getSize();

  const config = ForLoopRendererConfig[logicCellType];
  const { [config.logicIndexes]: logicIndexes, schemaTable } = schema;

  let toCloneRecords = [];
  let baseSchema: ForeachLogicCellSchema;

  schemaTable[config.scanner]((cell, pos) => {
    const isRow = logicCellType === LogicCellType.forRow;
    if (!logicIndexes.has(isRow ? pos.col : pos.row)) {
      return;
    }

    const prepareToClone = () => {
      const { targetArray, loopArgs } = baseSchema;
      const [itemName, indexName] = loopArgs;

      ingestDataByRowOrCol(renderer, {
        isRow,
        itemName,
        indexName,
        itemIndex: 0,
        value: data[targetArray][0],
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
          table: renderer,
          ...(isRow
            ? {
                targetIdx: pos.row,
                startFromIdx: pos.col + 1,
              }
            : {
                targetIdx: pos.col,
                startFromIdx: pos.row + 1,
              }),
        }),
      );
    };

    const isLastOne = isRow ? pos.row === rowSize - 1 : pos.col === colSize - 1;

    if (checkCellIsForeachLogic(cell) && cell.logicType === logicCellType) {
      baseSchema = cell;
      prepareToClone();
      if (!isLastOne) {
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

      if (!isLastOne) {
        return;
      }
    }

    if (baseSchema && toCloneRecords.length > 0) {
      const { targetArray, loopArgs } = baseSchema;
      const [itemName, indexName] = loopArgs;

      let appendAfterIndex = isRow ? pos.row : pos.col;

      for (let i = 1; i < data[targetArray].length; i++) {
        const value = data[targetArray][i];

        toCloneRecords.forEach((toCloneRecord) => {
          const targetIdx = isRow
            ? renderer.appendNewRowAfterTheIndex(
                toCloneRecord,
                appendAfterIndex,
              )
            : renderer.appendNewColAfterTheIndex(
                toCloneRecord,
                appendAfterIndex,
              );

          ingestDataByRowOrCol(renderer, {
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
    }

    // clean up
    baseSchema = null;
    toCloneRecords = [];
  });
}

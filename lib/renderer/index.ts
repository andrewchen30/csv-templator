import {
  ingestDataByRow,
  cloneRowByIdx,
  getParentCell,
  TableOperator,
} from '@/utils';
import {
  checkCellIsData,
  ForeachLogicCellSchema,
  checkCellIsForeachLogic,
  checkCellIsExtendLogic,
} from '@/type';
import { RendererCell, RendererInput, RendererOutput } from './type';
import { eval_exposeObjectAllKeys } from './eval';

export function render<Data>(input: RendererInput<Data>): RendererOutput {
  const renderer = prepareRenderer<Data>(input);
  return {
    table: renderOutput(renderer),
  };
}

function renderOutput(
  renderer: TableOperator<RendererCell>,
): TableOperator<string> {
  const output = renderer.initSameSizeEmptyTable<string>();

  renderer.scan((cell, pos) => {
    // when raw value is empty, just make an empty cell
    if (!cell || Object.keys(cell).length === 0 || !cell.eval) {
      output.updateCell(pos, '');
      return;
    }

    const body = `
      ${cell.data ? eval_exposeObjectAllKeys(cell.data) : ''}

      return ${cell.eval};
    `;

    const result = Function.apply(null, ['data', body])(cell.data);

    output.updateCell(pos, result.toString());
  }, false);

  return output;
}

function prepareRenderer<Data>(input: RendererInput<Data>) {
  const { schema, data } = input;
  const { schemaTable, logicColIndexes } = schema;
  const renderer = schemaTable.initSameSizeEmptyTable<RendererCell>();
  const [rowSize, colSize] = renderer.getSize();

  // ingest data into pure data cell
  schemaTable.scan((cell, pos) => {
    if (checkCellIsData(cell)) {
      renderer.updateCell(pos, { data, eval: cell.eval });
    }
  });

  let cloningRows = [];
  let baseForRowCell: ForeachLogicCellSchema;

  // ingest data into for-row logic row
  schemaTable.scanByCol((cell, pos) => {
    if (!logicColIndexes.has(pos.col)) {
      return;
    }

    const ingestCurrentRowAndPrepareToClone = () => {
      const { targetArray, loopArgs } = baseForRowCell;
      const [itemName, indexName] = loopArgs;

      ingestDataByRow(renderer, {
        colSize,
        itemName,
        indexName,
        index: 0,
        rowIdx: pos.row,
        startFromColIdx: pos.col + 1,
        value: data[targetArray][0],
      });
      cloningRows.push(cloneRowByIdx(renderer, pos.row, pos.col));
    };

    const isLastRow = pos.row === rowSize - 1;

    if (checkCellIsForeachLogic(cell)) {
      baseForRowCell = cell;
      ingestCurrentRowAndPrepareToClone();
      if (!isLastRow) {
        return;
      }
    }

    if (
      checkCellIsExtendLogic(cell) &&
      getParentCell(schemaTable, cell.parentPos)
    ) {
      ingestCurrentRowAndPrepareToClone();

      if (!isLastRow) {
        return;
      }
    }

    if (baseForRowCell) {
      const { targetArray, loopArgs } = baseForRowCell;
      const [itemName, indexName] = loopArgs;

      for (let i = 1; i < data[targetArray].length; i++) {
        const value = data[targetArray][i];

        cloningRows.forEach((cloningRow) => {
          const newRowIdx = renderer.pushNewRow(cloningRow);

          ingestDataByRow(renderer, {
            colSize,
            itemName,
            indexName,
            value,
            index: i,
            rowIdx: newRowIdx,
            startFromColIdx: pos.col + 1,
          });
        });
      }
    }

    // clean up
    cloningRows = [];
    baseForRowCell = null;
  });

  return renderer;
}

import { CellType, LogicCellType } from '@/type';
import { GetLogicCellInfoInput, parseLogicCellInfo } from '../logicCell';

describe('Logic/Parser', () => {
  const successCases: {
    desc: string;
    input: GetLogicCellInfoInput;
    expectLogicType: LogicCellType;
    expectExtraOutput: any;
  }[] = [
    {
      desc: 'should successfully parse for-col',
      input: {
        raw: '// for-col sh in po.shipment',
        pos: { row: 0, col: 0 },
      },
      expectLogicType: LogicCellType.forCol,
      expectExtraOutput: {
        loopArgs: ['sh'],
        targetArray: 'po.shipment',
      },
    },
    {
      desc: 'should successfully parse for-row',
      input: {
        raw: '// for-row sh in po.shipment',
        pos: { row: 2, col: 2 },
      },
      expectLogicType: LogicCellType.forRow,
      expectExtraOutput: {
        loopArgs: ['sh'],
        targetArray: 'po.shipment',
      },
    },
    {
      desc: 'should successfully extend-col',
      input: {
        raw: '// extend-col',
        pos: { row: 2, col: 2 },
        parentLogicPos: { row: 0, col: 1 },
      },
      expectLogicType: LogicCellType.extendCol,
      expectExtraOutput: {
        extendFromLoop: { row: 0, col: 1 },
      },
    },
    {
      desc: 'should successfully extend-row',
      input: {
        raw: '// extend-row',
        pos: { row: 2, col: 2 },
        parentLogicPos: { row: 0, col: 1 },
      },
      expectLogicType: LogicCellType.extendRow,
      expectExtraOutput: {
        extendFromLoop: { row: 0, col: 1 },
      },
    },
  ];

  it.each(successCases)(
    '$desc',
    ({ input, expectLogicType, expectExtraOutput }) => {
      const r = parseLogicCellInfo(input);

      expect(r.type).toEqual(CellType.logic);
      expect(r.logicType).toEqual(expectLogicType);
      expect(r._positionInTemplate).toEqual(input.pos);
      expect(r).toEqual(expect.objectContaining(expectExtraOutput));
    },
  );

  const errorCases: {
    desc: string;
    input: GetLogicCellInfoInput;
    expectErrorMsg: string;
  }[] = [
    {
      desc: 'using unknown for-XXX command pair',
      input: {
        raw: '// for-col sh XXX po.shipment',
        pos: { row: 2, col: 3 },
      },
      expectErrorMsg: '[2, 3] Invalid logic command for-XXX',
    },
    {
      desc: 'Missing parent for-loop in extend command',
      input: {
        raw: '// extend-col',
        pos: { row: 10, col: 10 },
      },
      expectErrorMsg:
        '[10, 10] Command extend must be dependent on a loop command',
    },
    {
      desc: 'Using unknown command',
      input: {
        raw: '// some-command',
        pos: { row: 1, col: 2 },
      },
      expectErrorMsg: '[1, 2] Invalid logic command some-command',
    },
  ];

  it.each(errorCases)('$desc', ({ input, expectErrorMsg }) => {
    const call = parseLogicCellInfo.bind(undefined, input);
    expect(call).toThrow(expectErrorMsg);
  });
});

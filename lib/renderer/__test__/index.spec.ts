import { CellPosition, CellType, DataCellSchema } from '@/type';
import { renderOutputCell } from '..';
import { RenderOptions } from '../type';

// hide console.error for test cases
console.error = jest.fn();

describe('render output', () => {
  const mockPos: CellPosition = {
    row: 0,
    col: 0,
  };

  const mockCellBase = {
    type: CellType.data,
    renderPosition: { row: 0, col: 0 },
    _positionInTemplate: { row: 0, col: 0 },
  } as const;

  const plans: {
    desc: string;
    input: {
      cell: DataCellSchema;
      pos: CellPosition;
      options?: RenderOptions;
    };
    expectOutput: string;
  }[] = [
    {
      desc: 'empty schema',
      input: {
        cell: null,
        pos: mockPos,
      },
      expectOutput: '',
    },
    {
      desc: 'render string',
      input: {
        cell: {
          ...mockCellBase,
          eval: '"hello"',
          data: {},
        },
        pos: mockPos,
      },
      expectOutput: 'hello',
    },
    {
      desc: 'render number',
      input: {
        cell: {
          ...mockCellBase,
          eval: '1',
          data: {},
        },
        pos: mockPos,
      },
      expectOutput: '1',
    },
    {
      desc: 'render string from data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'name',
          data: {
            name: 'Andrew',
            age: 30,
          },
        },
        pos: mockPos,
      },
      expectOutput: 'Andrew',
    },
    {
      desc: 'render number from data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'age',
          data: {
            name: 'Andrew',
            age: 30,
          },
        },
        pos: mockPos,
      },
      expectOutput: '30',
    },
    {
      desc: 'handle undefined data key',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'phone',
          data: {
            name: 'Andrew',
            age: 30,
          },
        },
        pos: mockPos,
      },
      expectOutput: '',
    },
    {
      desc: 'handle undefined data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'phone',
          data: {
            name: 'Andrew',
            age: 30,
            phone: undefined,
          },
        },
        pos: mockPos,
      },
      expectOutput: '',
    },
    {
      desc: 'handle null data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'phone',
          data: {
            name: 'Andrew',
            age: 30,
            phone: null,
          },
        },
        pos: mockPos,
      },
      expectOutput: '-',
    },
    {
      desc: 'handle custom NaN data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'a / b',
          data: {
            a: 0,
            b: 0,
          },
        },
        pos: mockPos,
        options: {
          defaultValFor_NaN: 'xx',
        },
      },
      expectOutput: 'xx',
    },

    {
      desc: 'handle custom undefined data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'a.b',
          data: {
            a: {},
          },
        },
        pos: mockPos,
        options: {
          defaultValFor_Undefined: 'yy',
        },
      },
      expectOutput: 'yy',
    },

    {
      desc: 'handle custom null data',
      input: {
        cell: {
          ...mockCellBase,
          eval: 'a',
          data: {
            a: null,
          },
        },
        pos: mockPos,
        options: {
          defaultValFor_Null: 'zz',
        },
      },
      expectOutput: 'zz',
    },
  ];

  it.each(plans)('$desc', ({ input, expectOutput }) => {
    const r = renderOutputCell(input.cell, input.pos, input.options);
    expect(r).toEqual(expectOutput);
  });
});

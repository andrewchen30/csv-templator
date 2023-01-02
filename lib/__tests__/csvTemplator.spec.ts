import CSVTemplator from '@/index';

describe('CSV Templator', () => {
  describe('parse schema ', () => {
    const successCases: {
      desc: string;
      template: string;
    }[] = [
      {
        desc: 'should parse data cell (Horizontal)',
        template: `
          | 'aaa' |
          | 'bbb' |
          | 'ccc' |
        `,
      },
      {
        desc: 'should parse data cell (Vertical)',
        template: `
          | 'aaa' | 'bbb' | 'ccc' |
        `,
      },
      {
        desc: 'should parse data cell (Mixed)',
        template: `
          | 'aaa' | 'bbb' |
          | 'ccc' | 'ddd' |
          | 'eee' | 'fff' |
        `,
      },
    ];

    it.each(successCases)('$desc', ({ template }) => {
      const templator = new CSVTemplator();
      templator.useTemplate(template);

      expect(templator._schema).toMatchSnapshot();
      expect(templator._logicColIndexes).toMatchSnapshot();
      expect(templator._logicRowIndexes).toMatchSnapshot();
    });
  });
});

import CSVTemplator from '@/index';

describe('CSV Templator', () => {
  describe('parse schema', () => {
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
      {
        desc: 'should parse for-col',
        template: `
          | // for-col item in list | 
          | item.name | 
          | item.name |
          | item.name |
        `,
      },
      {
        desc: 'should parse for-row',
        template: `
          | // for-row item in list | item.name | item.name | item.name |
        `,
      },
      {
        desc: 'should parse extend-col and extend-row',
        template: `

        | | // for-col item in list |
        | | item.name |
        | | item.name |
        | | item.name |
        | // for-row item2 in list | item2[item.name] |
      `,
      },
    ];

    it.each(successCases)('$desc', ({ template }) => {
      const templator = new CSVTemplator();
      templator.useTemplate(template);

      expect(templator._schema).toMatchSnapshot('_schema');
      expect(templator._logicColIndexes).toMatchSnapshot('_logicColIndexes');
      expect(templator._logicRowIndexes).toMatchSnapshot('_logicRowIndexes');
    });
  });

  describe('prepare render data', () => {
    const successCases: {
      desc: string;
      template: string;
      data: any;
    }[] = [
      {
        desc: 'should successfully prepare data for render',
        template: `
        | | "name" | "age"
        | // for-row user in users | user.name | user.age |
      `,
        data: {
          users: [
            { name: 'Andrew', age: 30 },
            { name: 'Joanne', age: 28 },
            { name: 'Frank', age: 22 },
          ],
        },
      },
    ];

    it.each(successCases)('$desc', ({ template, data }) => {
      const templator = new CSVTemplator();
      templator.useTemplate(template);
      templator.render(data);

      expect(templator._rawValue).toMatchSnapshot('_rawValue');
    });
  });
});

import { Schema } from '@/type';
import { Option, formatOption } from './option';
import { parseRawSchemaInput } from './inputParser';
import { parseSchema } from './schemaParser';
import { render } from './renderer';
import { formatCSV } from './utils';

export default class CSVTemplator<Data = any> {
  _option: Option;
  _schema: Schema;

  constructor(template: string, rawOption: Option = {}) {
    const option = formatOption(rawOption);

    const rawSchema = parseRawSchemaInput({
      raw: template,
      schemaStyle: option.schemaStyle,
    });

    const schema = parseSchema({
      rawSchema,
    });

    this._schema = schema;
    this._option = option;
  }

  public render(data: Data): string {
    const { table } = render({
      schema: this._schema,
      data,
    });
    return formatCSV(table, this._schema);
  }

  public renderToBuffer(data: Data): Buffer {
    return Buffer.from(this.render(data), 'utf-8');
  }
}

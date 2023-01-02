import SchemaParserByStyle from './rawSchemaParser';
import { TemplateSchema } from './type';
import { RawSchemaTable } from './rawSchemaParser/type';
import { Option, formatOption } from './option';

export default class CSVTemplator<Data> {
  private _option: Option;

  private _rawTemplate: string;
  private _rawSchema: RawSchemaTable;
  private _schema: TemplateSchema;

  constructor(option: Option) {
    this._option = formatOption(option);
  }

  public render(data: Data): Buffer {
    // TODO:
    return Buffer.from('', 'utf-8');
  }

  public useTemplate(template: string) {
    const rawSchema = this._getSchemaParser().parse(template);

    // validate rawSchema, directly throw error if invalid
    this._validateRawSchema(this._rawSchema);

    this._rawSchema = rawSchema;
    this._rawTemplate = template;
  }

  private _getSchemaParser() {
    const { schemaStyle } = this._option;
    return SchemaParserByStyle[schemaStyle];
  }

  private _validateRawSchema(rawSchema: RawSchemaTable): boolean {
    // TODO: validate rawTable
    return true;
  }

  private _parseTemplateToSchema(template: string): TemplateSchema {
    // TODO:
    // recursively parse raw table
    // check is logic cell
    // parse logic cell
    // parse all un-parse cell to data cell
    return [];
  }
}

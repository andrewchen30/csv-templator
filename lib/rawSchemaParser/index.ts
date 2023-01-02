import { SchemaStyle } from './constants';
import { SchemaParser } from './type';
import NotionSchemaParser from './notion';

const SchemaParserByStyle: { [schemaStyle in SchemaStyle]: SchemaParser } = {
  [SchemaStyle.NOTION]: new NotionSchemaParser(),
};

export default SchemaParserByStyle;

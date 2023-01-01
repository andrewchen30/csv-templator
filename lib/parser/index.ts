import { SchemaStyle } from './constants';
import { SchemaParser } from './type';
import NotionSchemaParser from './notion';

const schemaParserByStyle: { [schemaStyle in SchemaStyle]: SchemaParser } = {
  [SchemaStyle.NOTION]: new NotionSchemaParser(),
};

export default schemaParserByStyle;

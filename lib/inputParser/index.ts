import { ExtensionType } from './const';
import NotionExtension from './notion';
import {
  Extension,
  RawSchemaInputParserInput,
  RawSchemaInputParserOutput,
} from './type';

const ExtensionByStyle: { [schemaStyle in ExtensionType]: Extension } = {
  [ExtensionType.NOTION]: new NotionExtension(),
};

export function parseRawSchemaInput(
  input: RawSchemaInputParserInput,
): RawSchemaInputParserOutput {
  const { raw, schemaStyle } = input;
  const ext = ExtensionByStyle[schemaStyle];

  if (!ext) {
    throw new Error(`Unknown schema style: ${schemaStyle}`);
  }

  return ext.parse(raw);
}

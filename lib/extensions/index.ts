import { ExtensionType } from './constants';
import { Extension } from './type';
import NotionExtension from './notion';

const ExtensionByStyle: { [schemaStyle in ExtensionType]: Extension } = {
  [ExtensionType.NOTION]: new NotionExtension(),
};

export default ExtensionByStyle;

import { SchemaStyle } from './parser/constants';

export type Option = {
  schemaStyle?: SchemaStyle;
};

const defaultOption: Option = {
  schemaStyle: SchemaStyle.NOTION,
};

// TODO: validate userInput
export function formatOption(userInput: Option = {}): Option {
  return {
    ...defaultOption,
    ...userInput,
  };
}

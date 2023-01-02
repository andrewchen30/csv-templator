import { ExtensionType } from './extensions/constants';

export type Option = {
  schemaStyle?: ExtensionType;
};

const defaultOption: Option = {
  schemaStyle: ExtensionType.NOTION,
};

// TODO: validate userInput
export function formatOption(userInput: Option = {}): Option {
  return {
    ...defaultOption,
    ...userInput,
  };
}

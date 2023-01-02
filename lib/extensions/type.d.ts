import { RawTable } from '@/type';

export interface Extension {
  parse(raw: string): RawTable<string>;

  // TODO:
  // getDemoTable(data: RawTable): string;
}

import { RawTable } from '@/type';

export interface Extension {
  parse(raw: string): RawTable;

  // TODO:
  // getDemoTable(data: RawTable): string;
}

import { SchemaStyle } from './constants';
import { SchemaParser, RawTable } from './type';

// Demo:
// |  | “companyName” | format(today, ‘DD/MM/YYYY’) |
// | --- | --- | --- |
// |  |  | users.foreachCol(po) |
// |  | "User Number” | u.id |
// |  |  |  |
// |  | “Name” | sh.name |
export default class NotionSchemaParser implements SchemaParser {
  shouldUseParser(style: SchemaStyle): boolean {
    return style === SchemaStyle.NOTION;
  }

  parse(raw: string): RawTable {
    const rows = raw.split('\n').filter(Boolean);
    return rows
      .map((row) =>
        row
          .split('|')
          .map((str) => str.trim().replace('---', ''))
          .filter(Boolean),
      )
      .filter((cells) => cells.length >= 1);
  }
}

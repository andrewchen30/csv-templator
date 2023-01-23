import { TableOperator } from '@/utils';
import { Extension } from './type';

export default class NotionExtension implements Extension {
  parse(raw: string): TableOperator<string> {
    const rows = raw
      // replace all special quotation from notion
      .replace(/(\"|“|”|‘|’)/g, "'")
      .split('\n')
      .filter(Boolean)
      // remove table header structure in notion
      // | --- | --- | --- |
      .filter((x) => !this.checkIsHeaderRow(x))
      .map((row) =>
        row
          .split('|')
          .filter(Boolean)

          // notion table has an extra empty cell at the beginning
          .slice(1)

          .map((str) => str.trim()),
      )
      .filter((cells) => cells.length >= 1);

    const table = new TableOperator(rows);

    // if all last cell is empty, remove the last column
    const lastColIdx = rows[0].length - 1;
    let isAllEmpty = true;
    table.scanColByIndex(lastColIdx, (cell) => {
      if (cell) {
        isAllEmpty = false;
      }
    });

    if (isAllEmpty) {
      table.removeColByIndex(lastColIdx);
    }

    return table;
  }

  private checkIsHeaderRow(rawRowStr: string): boolean {
    const repeatedChars = '| --- '.split('');

    let currentCharIdx = 0;

    for (const char of rawRowStr.trim()) {
      if (currentCharIdx === repeatedChars.length) {
        currentCharIdx = 0;
      }

      if (char !== repeatedChars[currentCharIdx]) {
        return false;
      }

      currentCharIdx += 1;
    }

    return true;
  }
}

import { SchemaStyle } from '../constants';
import NotionParser from '../notion';

describe('Notion Parser', () => {
  const parser = new NotionParser();

  it('should usion parser', () => {
    expect(parser.shouldUseParser(SchemaStyle.NOTION)).toBe(true);
  });

  it('should parse a Notion page', async () => {
    const notionTable = `
    |  | ‘companyName’ | format(today, ‘DD/MM/YYYY’) |
    | --- | --- | --- |
    |  |  | orders.foreachCol(po) |
    |  | "Order Number” | po.orderNumber |
    |  |  | // for-col [sh, i] in po.shipment  |
    |  | “Name” | sh.id |
    |  | “Status” | shipmentStatusDic[sh.status] |
    |  | “ETA” | format(sh.eta, ‘DD/MM/YYYY’) |
    |  | “ETD” | format(sh.etd, ‘DD/MM/YYYY’) |
    |  |  |  |
    | // for-row (item in allOrderedSkus) | item.sku | sh.lineItemBySku[item.sku] ?? ‘-’ |
    `;

    expect(parser.parse(notionTable)).toMatchSnapshot();
  });

  it('should successfully with special quotation', () => {
    const notionTable = `
    | ‘aaa’ |
    | “bbb” |
    | "ccc" |
    `;

    expect(parser.parse(notionTable)).toEqual([
      ["'aaa'"],
      ["'bbb'"],
      ["'ccc'"],
    ]);
  });
});

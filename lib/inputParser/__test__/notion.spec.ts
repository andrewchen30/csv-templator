import NotionParser from '../notion';

describe('InputParser/Notion', () => {
  const parser = new NotionParser();

  it('should parse a Notion page', async () => {
    const notionTable = `
    |  | ‘companyName’ | format(today, ‘DD/MM/YYYY’) |
    | --- | --- | --- |
    |  |  | orders.foreachCol(po) |
    |  | "Order Number” | po.orderNumber |
    |  |  | % for-col [sh, i] in po.shipment  |
    |  | “Name” | sh.id |
    |  | “Status” | shipmentStatusDic[sh.status] |
    |  | “ETA” | format(sh.eta, ‘DD/MM/YYYY’) |
    |  | “ETD” | format(sh.etd, ‘DD/MM/YYYY’) |
    |  |  |  |
    | % for-row (item in allOrderedSkus) | item.sku | sh.lineItemBySku[item.sku] ?? ‘-’ |
    `;

    expect(parser.parse(notionTable).toArray()).toMatchSnapshot();
  });

  it('should successfully with special quotation', () => {
    const notionTable = `
    | ‘aaa’ |
    | “bbb” |
    | "ccc" |
    `;

    expect(parser.parse(notionTable).toArray()).toEqual([
      ["'aaa'"],
      ["'bbb'"],
      ["'ccc'"],
    ]);
  });
});

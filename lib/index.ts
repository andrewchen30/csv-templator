export function render<T = any>(template: string, data: T): Buffer {
  console.log('JUST A DEMO');

  return Buffer.from(
    `
    title1, title2, title3
    value1, value2, value3`,
    'utf-8',
  );
}

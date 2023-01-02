export function eval_exposeObjectAllKeys(
  data: any,
  baseVariableName: string = 'data',
): string {
  return `
    const {
      ${Object.keys(data).join(', ')}
    } = ${baseVariableName};
  `;
}

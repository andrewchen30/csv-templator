export function getValueByPath(
  o: any,
  path: string,
  defaultValue: any = null,
): any {
  if (!o) {
    return defaultValue;
  }

  const pathArr = path.split('.');

  let result = o;

  for (let i = 0; i < pathArr.length; i++) {
    const key = pathArr[i];

    if (result[key] === undefined) {
      return defaultValue;
    }

    result = result[key];
  }

  return result;
}

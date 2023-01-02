export function renderString(val: any, defaultValue: string = ''): string {
  if (val === 0) {
    return '0';
  }

  if (val === false) {
    return 'false';
  }

  return val ? val.toString() : defaultValue;
}

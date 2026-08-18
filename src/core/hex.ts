export const hexToRgb = (hex: string): string => {
  let value = hex.startsWith('#') ? hex.slice(1) : hex;

  if (value.length === 3) {
    value = value.replace(/(.)/g, '$1$1');
  }

  const rgb: number[] = [];
  value.replace(/../g, (chunk) => {
    rgb.push(parseInt(chunk, 16));
    return chunk;
  });

  return `rgb(${rgb.join(',')})`;
};

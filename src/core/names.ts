export const camelCase = (input: string): string => {
  const words = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
};

export const pascalCase = (input: string): string => {
  const value = camelCase(input);
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const trimIconPrefix = (iconId: string, prefix: string): string => {
  if (!prefix) {
    return iconId;
  }

  return iconId.replace(
    new RegExp(`^${prefix}(.+?)$`),
    (_matched, value: string) => value.replace(/^[-_.=+#@!~*]+(.+?)$/, '$1'),
  );
};

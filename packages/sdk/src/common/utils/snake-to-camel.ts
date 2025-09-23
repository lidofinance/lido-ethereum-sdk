/**
 * Converts snake_case string to camelCase
 * @param str - The snake_case string to convert
 * @returns The camelCase version of the string
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

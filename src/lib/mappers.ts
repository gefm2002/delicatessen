// Convert snake_case to camelCase
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert camelCase to snake_case
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Convert object keys from snake_case to camelCase
export function keysToCamel<T extends Record<string, any>>(obj: T): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamel(item));
  }

  const camelObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      camelObj[camelKey] = keysToCamel(obj[key]);
    }
  }
  return camelObj;
}

// Convert object keys from camelCase to snake_case
export function keysToSnake<T extends Record<string, any>>(obj: T): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnake(item));
  }

  const snakeObj: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      snakeObj[snakeKey] = keysToSnake(obj[key]);
    }
  }
  return snakeObj;
}

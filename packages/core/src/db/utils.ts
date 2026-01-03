/**
 * Batches an array into smaller arrays of a given size.
 *
 * This is useful for batching operations, such as inserting multiple rows into
 * the database.
 *
 * @param array - The array to batch
 * @param batchSize - The size of the batches
 * @returns An array of arrays
 */
export function batchArray<T>(array: T[], batchSize: number) {
  const result = [];
  for (let i = 0; i < array.length; i += batchSize) {
    result.push(array.slice(i, i + batchSize));
  }
  return result;
}

/**
 * Returns a string of SQL positional parameter placeholders for a given length and number of columns.
 *
 * This is useful for batching inserts into the database.
 *
 * @param length - The length of the array
 * @param cols - The number of columns
 * @returns A string of SQL positional parameter placeholders
 *
 * Example:
 * ```tsx
 * getSqlPositionalParamPlaceholders(3, 3)
 * // ($1, $2, $3),
 * // ($4, $5, $6),
 * // ($7, $8, $9)
 * ```
 */
export function getSqlParamPlaceholders(length: number, cols: number) {
  // $1, $2, $3, $4, $5, $6, $7, $8, $9, ...
  const params = Array.from({ length: length * cols }, (_, i) => `$${i + 1}`);

  // ($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ...
  return batchArray(params, cols)
    .map((p) => `\n        (${p.join(", ")})`)
    .join(", ");
}

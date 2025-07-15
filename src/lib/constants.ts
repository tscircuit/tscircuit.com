/**
 * Regular expression pattern for matching @tsci package imports
 * Rules:
 * - Must start with @tsci/
 * - First character after @tsci/ must be a letter
 * - Can contain letters, numbers, single dashes between alphanumeric characters
 * - Can have subpackages separated by single dots
 * - Cannot end with dots or dashes
 * - Cannot have consecutive dots or dashes
 */
export const TSCI_PACKAGE_PATTERN =
  /@tsci\/[a-zA-Z][a-zA-Z0-9]*(?:--?[a-zA-Z0-9]+)*(?:\.[a-zA-Z][a-zA-Z0-9_]*(?:--?[a-zA-Z0-9_]+)*)*/g

/**
 * Regular expression pattern for matching local file imports
 * Rules:
 * - Must start with ./ or ../
 * - Can contain letters, numbers, dots, dashes, underscores, and forward slashes
 * - Can optionally end with file extensions like .ts, .tsx, .js, .jsx, .json
 * - Captures the full relative path
 */
export const LOCAL_FILE_IMPORT_PATTERN =
  /(?:\.\.?\/[a-zA-Z0-9._\-\/]*(?:\.(?:ts|tsx|js|jsx|json))?)/g

export const normalizeName = (input: string): string => {
  return input
    .trim() // remove whitespace
    .toLowerCase() // convert to lowercase
    .normalize("NFD") // decompose unicode characters
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9_-]/g, "-") // replace invalid chars with dash
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, "") // remove leading/trailing dashes
}

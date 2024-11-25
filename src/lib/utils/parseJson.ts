export const parseJsonOrString = (jsonString: string): Record<string, any> => {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    // Convert string to an object with a value property if parsing fails
    return { value: jsonString }
  }
}

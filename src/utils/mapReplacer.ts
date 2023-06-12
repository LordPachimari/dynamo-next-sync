export function mapReplacer(key: string, value: unknown) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
export function reviver(key: string, value: unknown): unknown {
  if (typeof value === "object" && value !== null) {
    const valueObj = value as Record<string, unknown>;

    if (valueObj.dataType === "Map") {
      return new Map(valueObj.value as Iterable<[unknown, unknown]>);
    }
  }
  return value;
}

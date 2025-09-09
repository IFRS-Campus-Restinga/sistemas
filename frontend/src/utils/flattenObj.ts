export default function flattenValues(obj: any): any {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const keys = Object.keys(obj);

    // se o objeto tem apenas um atributo, substitui pelo valor desse atributo (recursivo)
    if (keys.length === 1) {
      return flattenValues(obj[keys[0]]);
    }

    // senão, percorre cada chave
    const newObj: Record<string, any> = {};
    for (const key of keys) {
      newObj[key] = flattenValues(obj[key]);
    }
    return newObj;
  } else if (Array.isArray(obj)) {
    return obj.map(flattenValues);
  }
  return obj; // valores primitivos permanecem
}
// extrae el número de un texto tipo "Item total: $29.99" → 29.99
export function extractPrice(priceText: string): number {
  const match = priceText.match(/\$(\d+\.?\d*)/); // grupo de captura omite el símbolo $
  return match ? parseFloat(match[1]) : 0; // 0 como fallback seguro — evita NaN en los expect
}

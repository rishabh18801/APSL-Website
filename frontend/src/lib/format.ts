const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function formatPrice(price: number | null, unit?: string) {
  if (price == null) return 'Price on request';
  return `${inr.format(price)}${unit ? ` / ${unit}` : ''}`;
}

export function productImage(images: string[] | undefined) {
  return images?.[0] || '/placeholder.svg';
}

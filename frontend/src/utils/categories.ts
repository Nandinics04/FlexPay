export const CATEGORIES = [
  { id: 'smartphones', label: 'Phones' },
  { id: 'utensils', label: 'Utensils' },
  { id: 'perfumes', label: 'Perfumes' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'appliances', label: 'Appliances' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function categoryLabel(id: string) {
  return CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export function variantLabels(category: string) {
  switch (category) {
    case 'perfumes':
      return { color: 'Scent', storage: 'Size' };
    case 'utensils':
      return { color: 'Finish', storage: 'Set size' };
    case 'beauty':
      return { color: 'Shade', storage: 'Size' };
    case 'appliances':
      return { color: 'Color', storage: 'Capacity' };
    default:
      return { color: 'Color', storage: 'Storage' };
  }
}

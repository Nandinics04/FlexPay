const USD_TO_INR = 83;
const CATEGORIES = ['smartphones', 'laptops', 'tablets'] as const;

const EMI_PLANS = [
  {
    id: 'emi-3m-0',
    tenureMonths: 3,
    interestRate: 0,
    cashbackAmount: 0,
    cashbackLabel: null,
    backingFund: 'Liquid mutual funds',
  },
  {
    id: 'emi-6m-0-cb',
    tenureMonths: 6,
    interestRate: 0,
    cashbackAmount: 1500,
    cashbackLabel: '₹1,500 cashback on first EMI',
    backingFund: 'Short-duration debt funds',
  },
  {
    id: 'emi-12m-10',
    tenureMonths: 12,
    interestRate: 10.5,
    cashbackAmount: 0,
    cashbackLabel: null,
    backingFund: 'Hybrid mutual funds',
  },
];

type DummyProduct = {
  id: number;
  title: string;
  description: string;
  brand?: string;
  category: string;
  price: number;
  discountPercentage?: number;
  thumbnail?: string;
  images?: string[];
  sku?: string;
};

export type SyncedProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  variants: Array<{
    sku: string;
    color: string;
    storage: string;
    mrp: number;
    sellingPrice: number;
    imageUrl: string;
  }>;
  emiPlans: typeof EMI_PLANS;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function storageOptions(category: string): [string, string] {
  if (category === 'laptops') {
    return ['512 GB', '1 TB'];
  }
  return ['128 GB', '256 GB'];
}

function colorOptions(product: DummyProduct): [string, string] {
  const title = product.title.toLowerCase();
  if (title.includes('starlight')) {
    return ['Starlight', 'Silver'];
  }
  if (title.includes('space grey') || title.includes('space gray')) {
    return ['Space Grey', 'Silver'];
  }
  if (title.includes('white')) {
    return ['White', 'Silver'];
  }
  if (title.includes('grey') || title.includes('gray')) {
    return ['Grey', 'Black'];
  }
  if (product.category === 'laptops') {
    return ['Space Grey', 'Silver'];
  }
  return ['Midnight', 'Silver'];
}

export function mapDummyProduct(product: DummyProduct): SyncedProduct {
  const images = [
    ...new Set((product.images ?? []).filter((url): url is string => Boolean(url))),
  ];
  if (images.length === 0 && product.thumbnail) {
    images.push(product.thumbnail);
  }
  const [colorA, colorB] = colorOptions(product);
  const [storageA, storageB] = storageOptions(product.category);
  const imageA = images[0] ?? '';
  const imageB = images[1] ?? images[0] ?? '';
  const sellingPrice = Math.round(product.price * USD_TO_INR);
  const discount = Math.min(product.discountPercentage ?? 8, 35);
  const mrp = Math.round(sellingPrice / (1 - discount / 100));
  const skuBase = slugify(product.title);

  const variants = [
    { color: colorA, storage: storageA, imageUrl: imageA },
    { color: colorB, storage: storageA, imageUrl: imageB },
    { color: colorA, storage: storageB, imageUrl: imageA },
    { color: colorB, storage: storageB, imageUrl: imageB },
  ].map((variant) => ({
    sku: `${skuBase}-${slugify(variant.color)}-${slugify(variant.storage)}`,
    color: variant.color,
    storage: variant.storage,
    mrp,
    sellingPrice:
      variant.storage === storageB
        ? Math.round(sellingPrice * 1.12)
        : sellingPrice,
    imageUrl: variant.imageUrl,
  }));

  return {
    slug: slugify(product.title),
    name: product.title,
    brand: product.brand || 'Generic',
    category: product.category,
    description: `${product.description} Shop on EMI backed by mutual funds with 1Fi.`,
    highlights: [
      `Category: ${product.category}`,
      `Brand: ${product.brand || 'Generic'}`,
      `Storage options: ${storageA} and ${storageB}`,
      `Finishes: ${colorA} and ${colorB}`,
      'Images synced from DummyJSON electronics catalog',
    ],
    variants,
    emiPlans: EMI_PLANS,
  };
}

export async function fetchElectronicsCatalog(): Promise<SyncedProduct[]> {
  const results = await Promise.all(
    CATEGORIES.map(async (category) => {
      const response = await fetch(
        `https://dummyjson.com/products/category/${category}?limit=50`,
      );
      if (!response.ok) {
        throw new Error(`DummyJSON ${category} request failed (${response.status})`);
      }
      const payload = (await response.json()) as { products?: DummyProduct[] };
      return payload.products ?? [];
    }),
  );

  const products = results.flat().map(mapDummyProduct);
  const unique = new Map<string, SyncedProduct>();
  for (const product of products) {
    unique.set(product.slug, product);
  }
  return [...unique.values()];
}

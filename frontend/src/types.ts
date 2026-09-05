export type Variant = {
  sku: string;
  color: string;
  storage: string;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
};

export type EmiPlan = {
  id: string;
  tenureMonths: number;
  interestRate: number;
  cashbackAmount: number;
  cashbackLabel: string | null;
  backingFund: string | null;
  monthlyAmount: number;
};

export type ProductListItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  startingPrice: number;
  mrp: number;
  imageUrl: string;
};

export type ProductDetail = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  variants: Variant[];
  emiPlans: EmiPlan[];
};

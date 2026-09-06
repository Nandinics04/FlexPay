export type ProductMedia = {
  type: 'image' | 'video';
  url: string;
};

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
  discountPercent: number;
  avgRating: number;
  reviewCount: number;
};

export type ProductReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  mine: boolean;
};

export type ProductDetail = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  media: ProductMedia[];
  variants: Variant[];
  emiPlans: EmiPlan[];
  avgRating: number;
  reviewCount: number;
  canReview: boolean;
  reviews: ProductReview[];
  myReview: { id?: string; rating: number; comment: string } | null;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  authProvider: 'email' | 'google' | 'both';
  role: 'user' | 'admin';
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  pan: string;
  aadhaar: string;
  creditPoints: number;
  cashbackBalance: number;
  avatarUrl: string | null;
  createdAt?: string;
};

export type ProfileUpdate = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  pan: string;
  aadhaar: string;
};

export type Order = {
  id: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  color: string;
  storage: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  payableAmount: number;
  pointsRedeemed: number;
  tenureMonths: number;
  interestRate: number;
  monthlyAmount: number;
  cashbackAmount: number;
  cashbackRedeemed: number;
  creditPointsEarned: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  cancelledAt?: string | null;
  createdAt: string;
};

export type ProductDraftVariant = {
  sku: string;
  color: string;
  storage: string;
  mrp: number;
  sellingPrice: number;
  imageUrl: string;
};

export type ProductDraftEmiPlan = {
  id?: string;
  tenureMonths: number;
  interestRate: number;
  cashbackAmount: number;
  cashbackLabel: string | null;
  backingFund: string | null;
};

export type ProductDraft = {
  slug?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  highlights: string[];
  media: ProductMedia[];
  variants: ProductDraftVariant[];
  emiPlans: ProductDraftEmiPlan[];
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

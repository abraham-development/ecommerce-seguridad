export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: Address | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  created_at: string;
}

export interface ProductSpecs {
  resolution?: string;
  night_vision?: string;
  ip_rating?: string;
  connectivity?: string;
  storage?: string;
  fov?: string;
  zoom?: string;
  channels?: number;
  compression?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  brand_id: string | null;
  category_id: string | null;
  images: string[];
  specs: ProductSpecs;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joins
  brand?: Brand;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  // Joins
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: Address;
  created_at: string;
  updated_at: string;
  // Joins
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  // Joins
  product?: Product;
}

// Store types
export interface CartItemLocal {
  product: Product;
  quantity: number;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "price_asc" | "price_desc" | "name_asc" | "newest";
}

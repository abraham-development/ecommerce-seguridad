import { createClient } from "@/lib/supabase/server";
import {
  mockBrands,
  mockCategories,
  mockOrderItems,
  mockOrders,
  mockProducts,
  mockUser,
} from "@/lib/mock-data";
import { generateSlug } from "@/lib/utils";
import type {
  Brand,
  Category,
  Order,
  OrderItem,
  Product,
  ProductFilters,
  Profile,
} from "@/types";
import type { User } from "@supabase/supabase-js";

type ProductListResult = {
  products: Product[];
  count: number;
};

type CurrentAccount = {
  user: User;
  profile: Profile | null;
};

function toProducts(data: unknown): Product[] {
  return (Array.isArray(data) ? data : []) as Product[];
}

function toCategories(data: unknown): Category[] {
  return (Array.isArray(data) ? data : []) as Category[];
}

function toBrands(data: unknown): Brand[] {
  return (Array.isArray(data) ? data : []) as Brand[];
}

function toOrders(data: unknown): Order[] {
  return (Array.isArray(data) ? data : []) as Order[];
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    const categories = toCategories(data);
    return categories.length > 0 ? categories : mockCategories;
  } catch {
    return mockCategories;
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    const brands = toBrands(data);
    return brands.length > 0 ? brands : mockBrands;
  } catch {
    return mockBrands;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;
    const products = toProducts(data);
    return products.length > 0 ? products : mockProducts.slice(0, 8);
  } catch {
    return mockProducts.slice(0, 8);
  }
}

export async function getProducts(
  filters: ProductFilters
): Promise<ProductListResult> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)", { count: "exact" })
      .eq("is_active", true);

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters.category) {
      const slugs = filters.category.split(",").filter(Boolean);
      const { data: categories, error } = await supabase
        .from("categories")
        .select("id")
        .in("slug", slugs);

      if (error) throw error;
      const categoryIds = ((categories ?? []) as Pick<Category, "id">[]).map(
        (category) => category.id
      );
      if (categoryIds.length === 0) return { products: [], count: 0 };
      query = query.in("category_id", categoryIds);
    }

    if (filters.brand) {
      const names = filters.brand.split(",").filter(Boolean);
      const { data: brands, error } = await supabase
        .from("brands")
        .select("id")
        .in("name", names);

      if (error) throw error;
      const brandIds = ((brands ?? []) as Pick<Brand, "id">[]).map(
        (brand) => brand.id
      );
      if (brandIds.length === 0) return { products: [], count: 0 };
      query = query.in("brand_id", brandIds);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    switch (filters.sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const from = (page - 1) * pageSize;
    const to = page * pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) throw error;
    return { products: toProducts(data), count: count ?? 0 };
  } catch {
    return getMockProducts(filters);
  }
}

function getMockProducts(filters: ProductFilters): ProductListResult {
  let products = [...mockProducts];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter((product) =>
      product.name.toLowerCase().includes(q)
    );
  }
  if (filters.category) {
    const slugs = filters.category.split(",");
    products = products.filter(
      (product) => product.category && slugs.includes(product.category.slug)
    );
  }
  if (filters.brand) {
    const brands = filters.brand.split(",");
    products = products.filter(
      (product) => product.brand && brands.includes(product.brand.name)
    );
  }
  if (filters.minPrice !== undefined) {
    const minPrice = filters.minPrice;
    products = products.filter((product) => product.price >= minPrice);
  }
  if (filters.maxPrice !== undefined) {
    const maxPrice = filters.maxPrice;
    products = products.filter((product) => product.price <= maxPrice);
  }

  switch (filters.sortBy) {
    case "price_asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "name_asc":
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  return {
    products: products.slice(start, start + pageSize),
    count: products.length,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data as Product;
  } catch {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Product;
  } catch {
    return mockProducts.find((product) => product.id === id) ?? null;
  }
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  try {
    const filters = [
      product.category_id ? `category_id.eq.${product.category_id}` : null,
      product.brand_id ? `brand_id.eq.${product.brand_id}` : null,
    ].filter((filter): filter is string => filter !== null);

    if (filters.length === 0) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .neq("id", product.id)
      .or(filters.join(","))
      .limit(4);

    if (error) throw error;
    return toProducts(data);
  } catch {
    return mockProducts
      .filter(
        (item) =>
          item.id !== product.id &&
          (item.category_id === product.category_id ||
            item.brand_id === product.brand_id)
      )
      .slice(0, 4);
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data as Category;
  } catch {
    return mockCategories.find((category) => category.slug === slug) ?? null;
  }
}

export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .eq("category_id", category.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return toProducts(data);
  } catch {
    return mockProducts.filter(
      (product) =>
        product.category?.slug === slug || product.category_id === category.id
    );
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const brands = await getBrands();
  return brands.find((brand) => generateSlug(brand.name) === slug) ?? null;
}

export async function getProductsByBrandSlug(slug: string): Promise<Product[]> {
  const brand = await getBrandBySlug(slug);
  if (!brand) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true)
      .eq("brand_id", brand.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return toProducts(data);
  } catch {
    return mockProducts.filter(
      (product) => product.brand && generateSlug(product.brand.name) === slug
    );
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return toProducts(data);
  } catch {
    return mockProducts;
  }
}

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { user, profile: (profile as Profile | null) ?? null };
  } catch {
    return null;
  }
}

export async function getUserOrders(limit?: number): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    let query = supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return toOrders(data);
  } catch {
    return limit ? mockOrders.slice(0, limit) : mockOrders;
  }
}

export async function getUserOrder(id: string): Promise<Order | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return data as Order;
  } catch {
    const order = mockOrders.find((item) => item.id === id);
    if (!order) return null;
    return {
      ...order,
      order_items: (mockOrderItems[id] ?? []).map((item) => ({
        ...item,
        product: mockProducts.find((product) => product.id === item.product_id),
      })) as OrderItem[],
    };
  }
}

export function getMockProfile(): Profile {
  return mockUser;
}

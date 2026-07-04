import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
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
  ProductSpecs,
  Profile,
} from "@/types";

type ProductListResult = {
  products: Product[];
  count: number;
};

type CurrentAccount = {
  user: {
    id: string;
    email: string | null;
  };
  profile: Profile | null;
};

interface ProductRow extends Omit<Product, "price" | "specs" | "brand" | "category"> {
  price: string | number;
  specs: ProductSpecs | null;
  brand: Brand | null;
  category: Category | null;
  total_count?: string | number;
}

interface OrderRow extends Omit<Order, "total" | "order_items" | "profile"> {
  total: string | number;
  order_items?: OrderItem[];
  profile?: Profile;
}

const productSelect = `
  SELECT
    p.*,
    row_to_json(b.*) AS brand,
    row_to_json(c.*) AS category
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

function toProduct(row: ProductRow): Product {
  return {
    ...row,
    price: Number(row.price),
    images: row.images ?? [],
    specs: row.specs ?? {},
    brand: row.brand ?? undefined,
    category: row.category ?? undefined,
  };
}

function toProducts(rows: ProductRow[]): Product[] {
  return rows.map(toProduct);
}

function toOrder(row: OrderRow): Order {
  return {
    ...row,
    total: Number(row.total),
  };
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

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await query<Category>(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    return categories.length > 0 ? categories : mockCategories;
  } catch {
    return mockCategories;
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const brands = await query<Brand>("SELECT * FROM brands ORDER BY name ASC");
    return brands.length > 0 ? brands : mockBrands;
  } catch {
    return mockBrands;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const rows = await query<ProductRow>(
      `${productSelect}
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT 8`
    );
    const products = toProducts(rows);
    return products.length > 0 ? products : mockProducts.slice(0, 8);
  } catch {
    return mockProducts.slice(0, 8);
  }
}

export async function getProducts(
  filters: ProductFilters
): Promise<ProductListResult> {
  try {
    const values: unknown[] = [];
    const where = ["p.is_active = TRUE"];

    if (filters.search) {
      values.push(`%${filters.search}%`);
      where.push(`p.name ILIKE $${values.length}`);
    }

    if (filters.category) {
      values.push(filters.category.split(",").filter(Boolean));
      where.push(`c.slug = ANY($${values.length})`);
    }

    if (filters.brand) {
      values.push(filters.brand.split(",").filter(Boolean));
      where.push(`b.name = ANY($${values.length})`);
    }

    if (filters.minPrice !== undefined) {
      values.push(filters.minPrice);
      where.push(`p.price >= $${values.length}`);
    }

    if (filters.maxPrice !== undefined) {
      values.push(filters.maxPrice);
      where.push(`p.price <= $${values.length}`);
    }

    const orderBy =
      filters.sortBy === "price_asc"
        ? "p.price ASC"
        : filters.sortBy === "price_desc"
        ? "p.price DESC"
        : filters.sortBy === "name_asc"
        ? "p.name ASC"
        : "p.created_at DESC";

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    values.push(pageSize, (page - 1) * pageSize);

    const rows = await query<ProductRow>(
      `
        SELECT
          p.*,
          row_to_json(b.*) AS brand,
          row_to_json(c.*) AS category,
          COUNT(*) OVER() AS total_count
        FROM products p
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE ${where.join(" AND ")}
        ORDER BY ${orderBy}
        LIMIT $${values.length - 1}
        OFFSET $${values.length}
      `,
      values
    );

    return {
      products: toProducts(rows),
      count: Number(rows[0]?.total_count ?? 0),
    };
  } catch {
    return getMockProducts(filters);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const row = await queryOne<ProductRow>(
      `${productSelect}
       WHERE p.slug = $1 AND p.is_active = TRUE
       LIMIT 1`,
      [slug]
    );
    return row ? toProduct(row) : null;
  } catch {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const row = await queryOne<ProductRow>(
      `${productSelect}
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );
    return row ? toProduct(row) : null;
  } catch {
    return mockProducts.find((product) => product.id === id) ?? null;
  }
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  try {
    if (!product.category_id && !product.brand_id) return [];

    const rows = await query<ProductRow>(
      `${productSelect}
       WHERE p.is_active = TRUE
         AND p.id <> $1
         AND (
           ($2::uuid IS NOT NULL AND p.category_id = $2::uuid)
           OR ($3::uuid IS NOT NULL AND p.brand_id = $3::uuid)
         )
       LIMIT 4`,
      [product.id, product.category_id, product.brand_id]
    );
    return toProducts(rows);
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
    return await queryOne<Category>(
      "SELECT * FROM categories WHERE slug = $1 LIMIT 1",
      [slug]
    );
  } catch {
    return mockCategories.find((category) => category.slug === slug) ?? null;
  }
}

export async function getProductsByCategorySlug(
  slug: string
): Promise<Product[]> {
  try {
    const rows = await query<ProductRow>(
      `${productSelect}
       WHERE p.is_active = TRUE AND c.slug = $1
       ORDER BY p.created_at DESC`,
      [slug]
    );
    return toProducts(rows);
  } catch {
    const category = mockCategories.find((item) => item.slug === slug);
    if (!category) return [];
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
    const rows = await query<ProductRow>(
      `${productSelect}
       WHERE p.is_active = TRUE AND p.brand_id = $1
       ORDER BY p.created_at DESC`,
      [brand.id]
    );
    return toProducts(rows);
  } catch {
    return mockProducts.filter(
      (product) => product.brand && generateSlug(product.brand.name) === slug
    );
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const rows = await query<ProductRow>(
      `${productSelect}
       ORDER BY p.created_at DESC`
    );
    return toProducts(rows);
  } catch {
    return mockProducts;
  }
}

export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

export async function getUserOrders(limit?: number): Promise<Order[]> {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const values: unknown[] = [user.id];
    const limitClause = limit !== undefined ? "LIMIT $2" : "";
    if (limit !== undefined) values.push(limit);

    const rows = await query<OrderRow>(
      `SELECT * FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       ${limitClause}`,
      values
    );
    return rows.map(toOrder);
  } catch {
    return limit ? mockOrders.slice(0, limit) : mockOrders;
  }
}

export async function getUserOrder(id: string): Promise<Order | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const order = await queryOne<OrderRow>(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2 LIMIT 1",
      [id, user.id]
    );
    if (!order) return null;

    const items = await query<OrderItem & { product: ProductRow | null }>(
      `
        SELECT
          oi.*,
          row_to_json(p.*) AS product
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.created_at ASC
      `,
      [id]
    );

    return {
      ...toOrder(order),
      order_items: items.map((item) => ({
        ...item,
        unit_price: Number(item.unit_price),
        product: item.product ? toProduct(item.product) : undefined,
      })),
    };
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

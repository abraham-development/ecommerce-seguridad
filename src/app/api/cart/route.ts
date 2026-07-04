import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await query(
    `
      SELECT
        ci.*,
        row_to_json(p.*) AS product
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `,
    [user.id]
  );

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    product_id?: string;
    quantity?: number;
  };

  if (!body.product_id) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  const item = await queryOne(
    `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity
      RETURNING *
    `,
    [user.id, body.product_id, body.quantity ?? 1]
  );

  return NextResponse.json(item, { status: 201 });
}

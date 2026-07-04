import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import type { Address } from "@/types";

interface OrderItemPayload {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface OrderPayload {
  items?: OrderItemPayload[];
  shipping_address?: Address;
  total?: number;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as OrderPayload;
  if (!body.items || body.items.length === 0 || !body.shipping_address) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const order = await transaction(async (client) => {
    const [createdOrder] = await client.query<{ id: string }>(
      `
        INSERT INTO orders (user_id, status, total, shipping_address)
        VALUES ($1, 'pending', $2, $3)
        RETURNING *
      `,
      [user.id, body.total ?? 0, JSON.stringify(body.shipping_address)]
    );

    for (const item of body.items ?? []) {
      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price
          )
          VALUES ($1, $2, $3, $4)
        `,
        [createdOrder.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    await client.query("DELETE FROM cart_items WHERE user_id = $1", [user.id]);

    return createdOrder;
  });

  return NextResponse.json(order, { status: 201 });
}

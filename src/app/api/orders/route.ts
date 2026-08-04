import { NextResponse } from "next/server";
import {
  isLimaMetropolitanaDistrict,
  resolvePeruLocation,
} from "@/lib/peru-ubigeo";
import { getUrbanoPickupPoint } from "@/data/urbano-pickup-points";
import { createClient } from "@/lib/supabase/server";
import type { Address, ShippingAddress } from "@/types";

interface OrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface CreateOrderBody {
  items?: OrderItemInput[];
  shipping_address?: Partial<ShippingAddress>;
  total?: number;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as CreateOrderBody;
  const { items, shipping_address, total } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  if (
    !shipping_address?.names?.trim() ||
    !shipping_address.surnames?.trim() ||
    !shipping_address.mobile?.trim()
  ) {
    return NextResponse.json(
      { error: "Datos personales incompletos" },
      { status: 400 }
    );
  }

  if (
    shipping_address.shippingMethod !== "lima_delivery" &&
    shipping_address.shippingMethod !== "urbano_pickup"
  ) {
    return NextResponse.json(
      { error: "Modalidad de envío inválida" },
      { status: 400 }
    );
  }

  const pickupPoint =
    shipping_address.shippingMethod === "urbano_pickup"
      ? getUrbanoPickupPoint(shipping_address.pickupPointId?.trim() ?? "")
      : null;
  const ubigeo =
    shipping_address.shippingMethod === "lima_delivery"
      ? shipping_address.ubigeo?.trim() ?? ""
      : pickupPoint?.districtCode ?? "";
  const location = resolvePeruLocation(ubigeo);

  if (!location) {
    return NextResponse.json(
      { error: "Ubicación de entrega o recojo inválida" },
      { status: 400 }
    );
  }

  if (
    shipping_address.shippingMethod === "lima_delivery" &&
    (!isLimaMetropolitanaDistrict(ubigeo) ||
      !shipping_address.street?.trim() ||
      !shipping_address.reference?.trim())
  ) {
    return NextResponse.json(
      { error: "Dirección de Lima Metropolitana inválida o incompleta" },
      { status: 400 }
    );
  }

  if (shipping_address.shippingMethod === "urbano_pickup" && !pickupPoint) {
    return NextResponse.json(
      { error: "Punto Urbano inválido" },
      { status: 400 }
    );
  }

  if (typeof total !== "number" || !Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Total inválido" }, { status: 400 });
  }

  const normalizedStreet =
    shipping_address.shippingMethod === "lima_delivery"
      ? shipping_address.street?.trim() ?? ""
      : pickupPoint?.address ?? "";
  const normalizedReference =
    shipping_address.shippingMethod === "lima_delivery"
      ? shipping_address.reference?.trim() ?? ""
      : pickupPoint?.reference ?? "";

  const normalizedShippingAddress: ShippingAddress = {
    names: shipping_address.names.trim(),
    surnames: shipping_address.surnames.trim(),
    mobile: shipping_address.mobile.trim(),
    shippingMethod: shipping_address.shippingMethod,
    street: normalizedStreet,
    reference: normalizedReference,
    department: location.department.name,
    province: location.province.name,
    district: location.district.name,
    ubigeo: location.district.code,
    country: "Perú",
    ...(pickupPoint
      ? {
          pickupPointId: pickupPoint.id,
          pickupPointName: pickupPoint.name,
        }
      : {}),
  };

  interface ProfileUpdate {
    names: string;
    surnames: string;
    mobile: string;
    updated_at: string;
    address?: Address;
  }

  const profileUpdate: ProfileUpdate = {
    names: normalizedShippingAddress.names,
    surnames: normalizedShippingAddress.surnames,
    mobile: normalizedShippingAddress.mobile,
    updated_at: new Date().toISOString(),
  };

  if (normalizedShippingAddress.shippingMethod === "lima_delivery") {
    profileUpdate.address = {
      street: normalizedShippingAddress.street,
      reference: normalizedShippingAddress.reference,
      department: normalizedShippingAddress.department,
      province: normalizedShippingAddress.province,
      district: normalizedShippingAddress.district,
      ubigeo: normalizedShippingAddress.ubigeo,
      country: normalizedShippingAddress.country,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total,
      shipping_address: normalizedShippingAddress,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Create order items
  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Clear cart items
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json(order, { status: 201 });
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Pending orders count
    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('order_status', ['placed', 'confirmed']);

    // 2. Low stock variants count
    const { count: lowStock } = await supabaseAdmin
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 3);

    return NextResponse.json({
      pendingOrders: pendingOrders || 0,
      lowStock: lowStock || 0,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ pendingOrders: 0, lowStock: 0, error: err.message }, { status: 500 });
  }
}

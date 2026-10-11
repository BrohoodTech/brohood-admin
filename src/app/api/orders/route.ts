import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const payment = searchParams.get('payment');

    let query = supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('order_status', status.toLowerCase());
    }

    if (payment && payment !== 'all') {
      query = query.eq('payment_method', payment.toLowerCase());
    }

    if (search) {
      // Filter by order number or search inside jsonb shipping_address
      query = query.or(`order_number.ilike.%${search}%,courier_partner.ilike.%${search}%,tracking_number.ilike.%${search}%`);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    // Filter in-memory for shipping_address phone or name if user searched for customer name/phone
    let results = orders || [];
    if (search && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter((o) => {
        const addr = o.shipping_address || {};
        return (
          o.order_number?.toLowerCase().includes(q) ||
          addr.full_name?.toLowerCase().includes(q) ||
          addr.phone?.toLowerCase().includes(q) ||
          addr.city?.toLowerCase().includes(q) ||
          o.tracking_number?.toLowerCase().includes(q)
        );
      });
    }

    return NextResponse.json(results);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

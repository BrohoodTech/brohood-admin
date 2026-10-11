import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();

    // 1. Fetch profiles
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profErr) console.warn('Profiles query notice:', profErr.message);

    // 2. Fetch all orders to compute lifetime spend and find guest customers
    const { data: orders, error: ordErr } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (ordErr) throw ordErr;

    // 3. Aggregate customer records
    const customerMap = new Map<string, any>();

    // Add registered profiles
    (profiles || []).forEach((p) => {
      const key = p.phone || p.email || p.id;
      customerMap.set(key, {
        id: p.id,
        full_name: p.full_name || 'Customer',
        email: p.email || null,
        phone: p.phone || null,
        role: p.role || 'customer',
        created_at: p.created_at,
        orders_count: 0,
        lifetime_spend: 0,
        orders: [],
        addresses: [],
      });
    });

    // Populate from orders
    (orders || []).forEach((ord) => {
      const addr = ord.shipping_address || {};
      const key = addr.phone || ord.user_id || `guest-${ord.id}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: ord.user_id || ord.id,
          full_name: addr.full_name || 'Guest Buyer',
          email: addr.email || null,
          phone: addr.phone || null,
          role: 'customer',
          created_at: ord.created_at,
          orders_count: 0,
          lifetime_spend: 0,
          orders: [],
          addresses: [],
        });
      }

      const cust = customerMap.get(key);
      cust.orders_count += 1;
      cust.lifetime_spend += Number(ord.final_total || 0);
      cust.orders.push({
        id: ord.id,
        order_number: ord.order_number,
        created_at: ord.created_at,
        order_status: ord.order_status,
        final_total: ord.final_total,
        payment_method: ord.payment_method,
      });

      if (addr.address_line1 && !cust.addresses.some((a: any) => a.address_line1 === addr.address_line1)) {
        cust.addresses.push(addr);
      }
    });

    let customerList = Array.from(customerMap.values());

    if (search) {
      customerList = customerList.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.phone?.includes(search)
      );
    }

    // Sort by lifetime spend descending
    customerList.sort((a, b) => b.lifetime_spend - a.lifetime_spend);

    return NextResponse.json(customerList);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

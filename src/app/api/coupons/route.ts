import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: coupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(coupons || []);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discount_type = 'percentage',
      discount_value,
      min_order_value = 0,
      max_discount = 500,
      description,
      is_active = true,
      valid_until,
    } = body;

    if (!code || !discount_value) {
      return NextResponse.json({ error: 'Coupon code and discount value are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value: Number(discount_value),
        min_order_value: Number(min_order_value) || 0,
        max_discount: Number(max_discount) || null,
        description: description || null,
        is_active: Boolean(is_active),
        valid_until: valid_until || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

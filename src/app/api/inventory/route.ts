import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const filter = searchParams.get('filter'); // 'low' or 'out'

    let query = supabaseAdmin
      .from('product_variants')
      .select('*, product:products(*, category:categories(*), brand:brands(*))')
      .order('stock_quantity', { ascending: true });

    if (filter === 'low') {
      query = query.lte('stock_quantity', 3);
    } else if (filter === 'out') {
      query = query.eq('stock_quantity', 0);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data: variants, error } = await query;
    if (error) throw error;

    // Filter by category in memory if joined
    let results = variants || [];
    if (category && category !== 'all') {
      results = results.filter((v: any) => v.product?.category?.slug === category || v.product?.category?.id === category);
    }

    return NextResponse.json(results);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, variant_type, name, sku, stock_quantity, price_delta } = body;

    if (!product_id || !name || !sku) {
      return NextResponse.json({ error: 'product_id, name, and sku are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .insert({
        product_id,
        variant_type: ['size', 'color', 'edition'].includes(variant_type) ? variant_type : 'size',
        name,
        sku,
        stock_quantity: Number(stock_quantity) || 0,
        price_delta: Number(price_delta) || 0,
      })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

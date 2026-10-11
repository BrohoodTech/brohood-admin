import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { addQuantity = 10, variantIds } = await req.json();

    // If variantIds provided, restock those; else restock all <= 3
    let query = supabaseAdmin.from('product_variants').select('id, stock_quantity');
    if (variantIds && variantIds.length > 0) {
      query = query.in('id', variantIds);
    } else {
      query = query.lte('stock_quantity', 3);
    }

    const { data: variants, error } = await query;
    if (error) throw error;

    let updatedCount = 0;
    for (const v of variants || []) {
      const newStock = Number(v.stock_quantity || 0) + Number(addQuantity);
      await supabaseAdmin
        .from('product_variants')
        .update({ stock_quantity: newStock })
        .eq('id', v.id);
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Restocked ${updatedCount} variants with +${addQuantity} units.`,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

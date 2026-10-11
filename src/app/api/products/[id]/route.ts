import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*, category:categories(*), brand:brands(*), variants:product_variants(*), images:product_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(product);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      brand_id,
      category_id,
      description,
      specs,
      mrp,
      price,
      primary_image,
      is_hot,
      is_bestseller,
      is_new_arrival,
      is_active,
      variants = [],
      images = [],
    } = body;

    // 1. Update product base info
    const { data: product, error: prodError } = await supabaseAdmin
      .from('products')
      .update({
        title,
        slug: slug ? slugify(slug) : slugify(title),
        brand_id: brand_id || null,
        category_id: category_id || null,
        description: description || null,
        specs: specs || {},
        mrp: Number(mrp) || Number(price) || 0,
        price: Number(price) || 0,
        primary_image: primary_image || (images[0]?.image_url ?? null),
        is_hot: Boolean(is_hot),
        is_bestseller: Boolean(is_bestseller),
        is_new_arrival: Boolean(is_new_arrival),
        is_active: Boolean(is_active),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (prodError) throw prodError;

    // 2. Synchronize variants: delete old, insert new
    await supabaseAdmin.from('product_variants').delete().eq('product_id', id);

    if (variants && variants.length > 0) {
      const formattedVariants = variants.map((v: any, idx: number) => ({
        product_id: id,
        variant_type: ['size', 'color', 'dial', 'edition'].includes(v.variant_type) ? v.variant_type : 'size',
        name: v.name || `Variant ${idx + 1}`,
        sku: v.sku || `${slugify(title).substring(0, 10).toUpperCase()}-V${idx + 1}`,
        stock_quantity: Number(v.stock_quantity) || 0,
        price_delta: Number(v.price_delta) || 0,
      }));

      await supabaseAdmin.from('product_variants').insert(formattedVariants);
    }

    // 3. Synchronize images: delete old, insert new
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);

    if (images && images.length > 0) {
      const formattedImages = images.map((img: any, idx: number) => ({
        product_id: id,
        image_url: typeof img === 'string' ? img : img.image_url,
        is_primary: idx === 0 || Boolean(img.is_primary),
        sort_order: idx + 1,
      }));

      await supabaseAdmin.from('product_images').insert(formattedImages);
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete variants and images first
    await supabaseAdmin.from('product_variants').delete().eq('product_id', id);
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);

    // Delete product
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

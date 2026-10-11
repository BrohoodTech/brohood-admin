import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('products')
      .select('*, category:categories(*), brand:brands(*), variants:product_variants(*), images:product_images(*)')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      // Could be category_id or category slug
      const { data: cat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .or(`id.eq.${category},slug.eq.${category}`)
        .maybeSingle();

      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('is_active', status === 'active');
    }

    const { data: products, error } = await query;
    if (error) throw error;

    // Compute total stock per product
    const enrichedProducts = (products || []).map((p) => {
      const totalStock = (p.variants || []).reduce(
        (sum: number, v: { stock_quantity: number }) => sum + Number(v.stock_quantity || 0),
        0
      );
      return {
        ...p,
        total_stock: totalStock,
      };
    });

    return NextResponse.json(enrichedProducts);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Products GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      brand_id,
      category_id,
      description,
      specs,
      mrp,
      price,
      primary_image,
      is_hot = false,
      is_bestseller = false,
      is_new_arrival = true,
      is_active = true,
      variants = [],
      images = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const slug = body.slug ? slugify(body.slug) : slugify(title);

    // 1. Insert product record
    const { data: product, error: prodError } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        slug,
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
      })
      .select()
      .single();

    if (prodError) throw prodError;

    // 2. Insert variants if present
    if (variants && variants.length > 0) {
      const formattedVariants = variants.map((v: any, idx: number) => ({
        product_id: product.id,
        variant_type: ['size', 'color', 'dial', 'edition'].includes(v.variant_type) ? v.variant_type : 'size',
        name: v.name || `Variant ${idx + 1}`,
        sku: v.sku || `${slug.substring(0, 10).toUpperCase()}-V${idx + 1}`,
        stock_quantity: Number(v.stock_quantity) || 0,
        price_delta: Number(v.price_delta) || 0,
      }));

      const { error: varError } = await supabaseAdmin.from('product_variants').insert(formattedVariants);
      if (varError) {
        console.error('Variant insertion error:', varError);
      }
    }

    // 3. Insert images if present
    if (images && images.length > 0) {
      const formattedImages = images.map((img: any, idx: number) => ({
        product_id: product.id,
        image_url: typeof img === 'string' ? img : img.image_url,
        is_primary: idx === 0 || Boolean(img.is_primary),
        sort_order: idx + 1,
      }));

      const { error: imgError } = await supabaseAdmin.from('product_images').insert(formattedImages);
      if (imgError) {
        console.error('Images insertion error:', imgError);
      }
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Products POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

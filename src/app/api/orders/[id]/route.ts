import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, product:products(*))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(order);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const allowedUpdates: Record<string, any> = {};
    if (body.order_status !== undefined) allowedUpdates.order_status = body.order_status;
    if (body.payment_status !== undefined) allowedUpdates.payment_status = body.payment_status;
    if (body.courier_partner !== undefined) allowedUpdates.courier_partner = body.courier_partner;
    if (body.tracking_number !== undefined) allowedUpdates.tracking_number = body.tracking_number;
    if (body.notes !== undefined) allowedUpdates.notes = body.notes;

    allowedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(allowedUpdates)
      .eq('id', id)
      .select('*, items:order_items(*, product:products(*))')
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

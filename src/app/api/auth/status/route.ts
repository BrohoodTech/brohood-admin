import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = req.cookies.get('brohood_admin_session')?.value;
  return NextResponse.json({ authenticated: Boolean(session) });
}

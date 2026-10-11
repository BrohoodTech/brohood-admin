import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'brohood_admin_secret_2026';

    if (!password || password.trim() !== adminPassword.trim()) {
      return NextResponse.json(
        { error: 'Invalid Admin Access Key / PIN' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    
    // Set secure HttpOnly cookie valid for 7 days
    response.cookies.set({
      name: 'brohood_admin_session',
      value: 'authenticated_' + Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error processing authentication' }, { status: 500 });
  }
}

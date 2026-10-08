import { fetchPublicProducts } from '@/features/products/api';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  return NextResponse.json(await fetchPublicProducts(params as any));
}

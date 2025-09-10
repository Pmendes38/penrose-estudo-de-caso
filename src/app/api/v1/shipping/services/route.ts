// src/app/api/v1/shipping/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyShipping } from '../_lib/shipping-proxy';
export const revalidate = 3600; // 1h cache no edge
export async function GET(req: NextRequest) { return proxyShipping(req, '/services', { method: 'GET' }); }

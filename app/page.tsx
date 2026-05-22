export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/login', 'https://wikima-admin.pages.dev'));
}

export default function Home() {
  return null;
}

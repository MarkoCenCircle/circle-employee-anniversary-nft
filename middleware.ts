import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(5, '10 s'),
});


export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // not rate limiting in development environment
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_RATE_LIMITING === 'false') {
    return NextResponse.next()
  }

  // only rate limiting on API requests
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // You could alternatively limit based on user ID or similar
  const ip = request.ip ?? '127.0.0.1';
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    ip
  );
  return success
    ? NextResponse.next()
    : NextResponse.json({ reset }, { status: 429, statusText: 'Too Many Requests' });
}

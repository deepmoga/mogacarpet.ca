import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug || slug.length === 0) {
      return new NextResponse('Image path missing', { status: 400 });
    }

    const filename = slug.join('/');
    // Prevent directory traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');

    const candidates = [
      path.join(process.cwd(), 'public', 'images', safeFilename),
      path.join(process.cwd(), 'images', safeFilename),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const stat = fs.statSync(/*turbopackIgnore: true*/ filePath);
        if (stat.isFile()) {
          const buffer = fs.readFileSync(/*turbopackIgnore: true*/ filePath);
          const ext = path.extname(filePath).toLowerCase();
          const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
              'Content-Length': stat.size.toString(),
            },
          });
        }
      }
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (err: any) {
    return new NextResponse(err.message || 'Error serving image', { status: 500 });
  }
}

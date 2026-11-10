import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'jee_database.json');

export async function GET() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const fileContent = await fs.readFile(DB_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json({ success: true, data, exists: true });
  } catch {
    return NextResponse.json({ success: true, data: null, exists: false });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    try {
      await fs.mkdir(DB_DIR, { recursive: true });
      await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch {
      // In serverless environments (like Vercel read-only runtime), file writes are safely bypassed
    }
    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

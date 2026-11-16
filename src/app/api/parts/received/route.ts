import { NextResponse } from "next/server";
import { persistPartReceived } from "@/lib/parts";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    received?: boolean;
  } | null;
  const id = String(body?.id ?? "");
  const received = Boolean(body?.received);
  const ok = await persistPartReceived(id, received);
  if (!ok) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true });
}

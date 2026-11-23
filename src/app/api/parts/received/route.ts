import { NextResponse } from "next/server";
import { persistPartReceivedQty } from "@/lib/parts";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    receivedQty?: number;
  } | null;
  const id = String(body?.id ?? "");
  const receivedQty = Number(body?.receivedQty);
  const ok = await persistPartReceivedQty(id, receivedQty);
  if (!ok) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true });
}

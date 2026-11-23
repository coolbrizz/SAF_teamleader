import { NextResponse } from "next/server";
import { persistAtaDone } from "@/lib/atas";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    aircraftId?: string;
    ata?: string;
    done?: boolean;
  } | null;
  const aircraftId = String(body?.aircraftId ?? "");
  const ata = String(body?.ata ?? "");
  const done = Boolean(body?.done);
  const ok = await persistAtaDone(aircraftId, ata, done);
  if (!ok) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true });
}

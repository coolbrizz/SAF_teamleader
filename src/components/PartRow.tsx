"use client";

import { useState } from "react";
import { deletePartAction, setDaAction, setDesignationAction } from "@/app/actions/ops";
import { Btn, Input } from "@/components/fields";
import { cn } from "@/lib/utils";

const kindLabel: Record<string, string> = {
  TACHE: "Tâche",
  OE: "OE",
  CURA: "CURA",
  TS: "TS",
};

function persistReceivedQty(id: string, receivedQty: number) {
  void fetch("/api/parts/received", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, receivedQty }),
    keepalive: true,
    credentials: "same-origin",
  });
}

export function PartRow({
  chef,
  part,
}: {
  chef: boolean;
  part: {
    id: string;
    pn: string;
    taskKind: string;
    taskRef: string;
    quantity: number;
    designation: string | null;
    daNumber: string | null;
    receivedQty: number;
    createdBy: { trigramme: string };
  };
}) {
  const [da, setDa] = useState(part.daNumber ?? "");
  const [got, setGot] = useState(part.receivedQty);
  const saved = (part.daNumber ?? "").trim();
  const ordered = saved.length > 0;
  const dirty = da.trim() !== saved;
  const full = part.quantity > 0 && got >= part.quantity;
  const partial = got > 0 && !full;
  const tone = full ? "full" : partial ? "partial" : ordered ? "ordered" : "plain";

  function setQty(next: number) {
    const qty = Math.max(0, Math.min(part.quantity, Math.floor(next) || 0));
    setGot(qty);
    persistReceivedQty(part.id, qty);
  }

  return (
    <li
      className={cn(
        "overflow-hidden rounded-lg px-3 py-2 ring-1",
        tone === "full" && "bg-emerald-600 text-white ring-emerald-400",
        tone === "partial" && "bg-[#F97316] text-[#0B1220] ring-orange-300",
        tone === "ordered" && "bg-[#F5C518] text-[#0B1220] ring-yellow-300",
        tone === "plain" && "bg-background text-foreground ring-border",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "font-mono text-sm font-semibold",
              tone === "full" ? "text-white" : tone === "plain" ? "text-primary" : "text-[#0B1220]",
            )}
          >
            {part.pn}
            <span
              className={cn(
                "ml-2 font-sans text-sm font-normal",
                tone === "full" ? "text-white/95" : tone === "plain" ? "text-foreground" : "text-[#0B1220]",
              )}
            >
              {part.designation?.trim() || "—"} · ×{part.quantity}
            </span>
          </p>
          <p
            className={cn(
              "text-xs",
              tone === "full" ? "text-white/85" : tone === "plain" ? "text-muted-foreground" : "text-[#0B1220]/80",
            )}
          >
            {kindLabel[part.taskKind] ?? part.taskKind} {part.taskRef} · Commandé par{" "}
            {part.createdBy.trigramme}
            {!chef && (ordered ? ` · DA ${saved}` : " · non commandée")}
          </p>
          {!part.designation?.trim() && (
            <form action={setDesignationAction} className="mt-1 flex items-center gap-1">
              <input type="hidden" name="id" value={part.id} />
              <Input
                name="designation"
                placeholder="dénomination"
                autoComplete="off"
                required
                className={cn(
                  "h-7 min-h-7 w-44 py-0 text-xs",
                  tone === "full" && "!border-white/50 !bg-emerald-700 !text-white",
                  tone === "partial" && "!border-orange-800 !bg-orange-200 !text-[#0B1220]",
                  tone === "ordered" && "!border-yellow-700 !bg-yellow-200 !text-[#0B1220]",
                )}
              />
              <button type="submit" className="h-7 rounded-md border border-current px-1.5 text-[11px]">
                OK
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {chef && (
            <>
              <form action={setDaAction} className="flex items-center gap-1">
                <input type="hidden" name="id" value={part.id} />
                <Input
                  name="daNumber"
                  value={da}
                  onChange={(e) => setDa(e.target.value)}
                  placeholder="N° DA"
                  className={cn(
                    "h-8 min-h-8 w-28 py-0 text-sm",
                    tone === "full" && "!border-white/50 !bg-emerald-700 !text-white",
                    tone === "partial" && "!border-orange-800 !bg-orange-200 !text-[#0B1220]",
                    tone === "ordered" &&
                      "!border-yellow-700 !bg-yellow-200 !text-[#0B1220] placeholder:text-[#0B1220]/50",
                  )}
                />
                <Btn
                  type="submit"
                  className={cn(
                    "h-8 min-h-8 px-2 text-xs",
                    tone === "full" && "!bg-white !text-emerald-800",
                    tone === "ordered" && !dirty && "bg-[#0B1220] text-[#F5C518]",
                    dirty && "ring-2 ring-[#0B1220]",
                  )}
                >
                  Valider
                </Btn>
              </form>
              <label className="flex min-h-8 items-center gap-1 text-sm">
                <Input
                  type="number"
                  min={0}
                  max={part.quantity}
                  value={got}
                  aria-label={`Quantité reçue ${part.pn}`}
                  onChange={(e) => {
                    const next = Math.max(
                      0,
                      Math.min(part.quantity, Math.floor(Number(e.target.value) || 0)),
                    );
                    setGot(next);
                  }}
                  onBlur={(e) => {
                    const next = Math.max(
                      0,
                      Math.min(part.quantity, Math.floor(Number(e.target.value) || 0)),
                    );
                    setGot(next);
                    persistReceivedQty(part.id, next);
                  }}
                  className={cn(
                    "h-8 min-h-8 w-16 py-0 text-sm",
                    tone === "full" && "!border-white/50 !bg-emerald-700 !text-white",
                    tone === "partial" && "!border-orange-800 !bg-orange-200 !text-[#0B1220]",
                    tone === "ordered" && "!border-yellow-700 !bg-yellow-200 !text-[#0B1220]",
                  )}
                />
                <span>/ {part.quantity}</span>
                <input
                  type="checkbox"
                  checked={full}
                  onChange={(e) => setQty(e.currentTarget.checked ? part.quantity : 0)}
                  className="ml-1 size-5 accent-emerald-800"
                  aria-label={`${part.pn} tout reçu`}
                />
                reçue
              </label>
            </>
          )}
          {!chef && (partial || full) && (
            <span className="text-sm">
              reçue {got}/{part.quantity}
            </span>
          )}
          <form
            action={deletePartAction}
            onSubmit={(e) => {
              if (!confirm(`Supprimer ${part.pn} ?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={part.id} />
            <button
              type="submit"
              aria-label={`Supprimer ${part.pn}`}
              className="flex size-8 items-center justify-center rounded-md bg-white text-xl font-bold leading-none text-red-600 ring-1 ring-red-600"
            >
              ×
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

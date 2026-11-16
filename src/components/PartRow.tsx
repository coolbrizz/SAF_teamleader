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

function persistReceived(id: string, received: boolean) {
  void fetch("/api/parts/received", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, received }),
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
    received: boolean;
    createdBy: { trigramme: string };
  };
}) {
  const [da, setDa] = useState(part.daNumber ?? "");
  const ordered = da.trim().length > 0;
  const mechanicGreen = !chef && part.received;

  return (
    <li
      className={cn(
        "group overflow-hidden rounded-lg px-3 py-2 ring-1",
        chef &&
          "has-[input[name=received]:checked]:!bg-emerald-600 has-[input[name=received]:checked]:!text-white has-[input[name=received]:checked]:!ring-emerald-400",
        mechanicGreen
          ? "bg-emerald-600 text-white ring-emerald-400"
          : ordered
            ? "bg-[#F5C518] text-[#0B1220] ring-yellow-300"
            : "bg-background text-foreground ring-border",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="min-w-0 leading-tight">
          <p
            className={cn(
              "font-mono text-base font-semibold group-has-[input[name=received]:checked]:!text-white",
              mechanicGreen ? "text-white" : ordered ? "text-[#0B1220]" : "text-primary",
            )}
          >
            {part.pn}
            <span
              className={cn(
                "ml-2 font-sans text-sm font-normal group-has-[input[name=received]:checked]:!text-white",
                mechanicGreen ? "text-white/95" : ordered ? "text-[#0B1220]" : "text-foreground",
              )}
            >
              {part.designation?.trim() || "—"} · ×{part.quantity}
            </span>
          </p>
          <p
            className={cn(
              "text-xs group-has-[input[name=received]:checked]:!text-white/85",
              mechanicGreen
                ? "text-white/85"
                : ordered
                  ? "text-[#0B1220]/80"
                  : "text-muted-foreground",
            )}
          >
            {kindLabel[part.taskKind] ?? part.taskKind} {part.taskRef} · Commandé par{" "}
            {part.createdBy.trigramme}
            {!chef && (ordered ? ` · DA ${da.trim()}` : " · non commandée")}
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
                  mechanicGreen && "!border-white/50 !bg-emerald-700 !text-white",
                  ordered &&
                    !mechanicGreen &&
                    "!border-yellow-700 !bg-yellow-200 !text-[#0B1220]",
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
                    "h-8 min-h-8 w-28 py-0 text-sm group-has-[input[name=received]:checked]:!border-white/50 group-has-[input[name=received]:checked]:!bg-emerald-700 group-has-[input[name=received]:checked]:!text-white",
                    ordered &&
                      "!border-yellow-700 !bg-yellow-200 !text-[#0B1220] placeholder:text-[#0B1220]/50",
                  )}
                />
                <Btn
                  type="submit"
                  className={cn(
                    "h-8 min-h-8 px-2 text-xs group-has-[input[name=received]:checked]:!bg-white group-has-[input[name=received]:checked]:!text-emerald-800",
                    ordered && "bg-[#0B1220] text-[#F5C518]",
                  )}
                >
                  DA
                </Btn>
              </form>
              <label
                className={cn(
                  "flex min-h-8 cursor-pointer items-center gap-2 text-sm group-has-[input[name=received]:checked]:!text-white",
                  ordered ? "text-[#0B1220]" : "text-foreground",
                )}
              >
                <input
                  type="checkbox"
                  name="received"
                  defaultChecked={part.received}
                  onChange={(e) => persistReceived(part.id, e.currentTarget.checked)}
                  className="size-5 accent-emerald-800"
                />
                reçue
              </label>
            </>
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
              className={cn(
                "h-8 min-h-8 rounded-lg border px-2 text-xs",
                mechanicGreen
                  ? "border-white/70 text-white"
                  : ordered
                    ? "border-[#0B1220]/50 text-[#0B1220] group-has-[input[name=received]:checked]:border-white/70 group-has-[input[name=received]:checked]:text-white"
                    : "border-red-800 text-red-400 group-has-[input[name=received]:checked]:border-white/70 group-has-[input[name=received]:checked]:text-white",
              )}
            >
              Supprimer
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

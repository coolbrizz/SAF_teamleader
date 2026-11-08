"use client";

import { setDaAction } from "@/app/actions/ops";
import { Btn, Input } from "@/components/fields";
import { cn } from "@/lib/utils";

const kindLabel: Record<string, string> = {
  TACHE: "Tâche",
  OE: "OE",
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
    ata: string;
    taskKind: string;
    taskRef: string;
    quantity: number;
    daNumber: string | null;
    received: boolean;
    createdBy: { trigramme: string };
  };
}) {
  const ordered = Boolean(part.daNumber);
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
            ? "bg-orange-500 text-[#0B1220] ring-orange-300"
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
              ATA {part.ata} · {kindLabel[part.taskKind] ?? part.taskKind} {part.taskRef} · ×
              {part.quantity}
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
            {part.createdBy.trigramme}
            {!chef && (part.daNumber ? ` · DA ${part.daNumber}` : " · non commandée")}
          </p>
        </div>
        {chef && (
          <div className="flex flex-wrap items-center gap-2">
            <form action={setDaAction} className="flex items-center gap-1">
              <input type="hidden" name="id" value={part.id} />
              <Input
                name="daNumber"
                defaultValue={part.daNumber ?? ""}
                placeholder="N° DA"
                className={cn(
                  "h-8 min-h-8 w-28 py-0 text-sm group-has-[input[name=received]:checked]:!border-white/50 group-has-[input[name=received]:checked]:!bg-emerald-700 group-has-[input[name=received]:checked]:!text-white",
                  ordered &&
                    "!border-orange-800 !bg-orange-400 !text-[#0B1220] placeholder:text-[#0B1220]/50",
                )}
              />
              <Btn
                type="submit"
                className={cn(
                  "h-8 min-h-8 px-2 text-xs group-has-[input[name=received]:checked]:!bg-white group-has-[input[name=received]:checked]:!text-emerald-800",
                  ordered && "bg-[#0B1220] text-orange-400",
                )}
              >
                DA
              </Btn>
            </form>
            <label className="flex min-h-8 cursor-pointer items-center gap-2 text-sm text-[#0B1220] group-has-[input[name=received]:checked]:!text-white">
              <input
                type="checkbox"
                name="received"
                defaultChecked={part.received}
                onChange={(e) => persistReceived(part.id, e.currentTarget.checked)}
                className="size-5 accent-emerald-800"
              />
              Reçue box
            </label>
          </div>
        )}
      </div>
    </li>
  );
}

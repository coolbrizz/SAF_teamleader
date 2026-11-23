"use client";

import { useState } from "react";
import { claimAtaAction, releaseAtaAction } from "@/app/actions/ops";
import { cn } from "@/lib/utils";

type Person = { userId: string; trigramme: string };

export function AtaBoard({
  items,
  staff,
}: {
  items: {
    aircraftId: string;
    ata: string;
    label: string;
    people: Person[];
    done: boolean;
  }[];
  staff: { id: string; trigramme: string }[];
}) {
  const [rows, setRows] = useState(items);

  function toggle(ata: string, done: boolean) {
    const row = rows.find((item) => item.ata === ata);
    if (!row) return;
    setRows((list) => list.map((item) => (item.ata === ata ? { ...item, done } : item)));
    void fetch("/api/atas/done", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aircraftId: row.aircraftId, ata, done }),
      keepalive: true,
      credentials: "same-origin",
    });
  }

  function assign(ata: string, userId: string) {
    const member = staff.find((person) => person.id === userId);
    const row = rows.find((item) => item.ata === ata);
    if (!member || !row || row.people.some((person) => person.userId === userId)) return;
    setRows((list) =>
      list.map((item) =>
        item.ata === ata
          ? {
              ...item,
              people: [...item.people, { userId, trigramme: member.trigramme }].sort((a, b) =>
                a.trigramme.localeCompare(b.trigramme, "fr"),
              ),
            }
          : item,
      ),
    );
    const data = new FormData();
    data.set("aircraftId", row.aircraftId);
    data.set("ata", ata);
    data.set("userId", userId);
    void claimAtaAction(data);
  }

  function release(ata: string, userId: string) {
    const row = rows.find((item) => item.ata === ata);
    if (!row) return;
    setRows((list) =>
      list.map((item) =>
        item.ata === ata ? { ...item, people: item.people.filter((person) => person.userId !== userId) } : item,
      ),
    );
    const data = new FormData();
    data.set("aircraftId", row.aircraftId);
    data.set("ata", ata);
    data.set("userId", userId);
    void releaseAtaAction(data);
  }

  return (
    <ul className="grid grid-cols-5 gap-2">
      {rows.map((row) => (
        <li
          key={row.ata}
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 ring-1",
            row.done ? "ring-emerald-500" : "ring-border",
          )}
        >
          <input
            type="checkbox"
            checked={row.done}
            onChange={(e) => toggle(row.ata, e.currentTarget.checked)}
            className="size-4 shrink-0 accent-emerald-600"
            aria-label={`${row.label} terminé`}
          />
          <span
            className={cn(
              "flex shrink-0 items-center whitespace-nowrap text-sm font-semibold",
              row.done && "line-through",
            )}
          >
            <span className={cn(row.done && "text-muted-foreground")}>{row.label}</span>
            {row.people.map((person) => (
              <button
                key={person.userId}
                type="button"
                onClick={() => release(row.ata, person.userId)}
                className="font-semibold text-[#F5C518]"
                aria-label={`Retirer ${person.trigramme} de ${row.label}`}
              >
                {" - "}
                {person.trigramme}
              </button>
            ))}
          </span>
          {!row.done && (
            <select
              aria-label={`Affecter ${row.label}`}
              className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-1 text-xs"
              value=""
              onChange={(e) => {
                assign(row.ata, e.currentTarget.value);
                e.currentTarget.value = "";
              }}
            >
              <option value="">—</option>
              {staff
                .filter((person) => !row.people.some((assigned) => assigned.userId === person.id))
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.trigramme}
                  </option>
                ))}
            </select>
          )}
        </li>
      ))}
    </ul>
  );
}

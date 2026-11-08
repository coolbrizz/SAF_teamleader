"use client";

import { deleteAircraftAction } from "@/app/actions/team";

export function DeleteAircraftButton({ aircraftId, registration }: { aircraftId: string; registration: string }) {
  return (
    <form
      action={deleteAircraftAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Supprimer ${registration} définitivement (pièces, remarques, affectations) ?`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="aircraftId" value={aircraftId} />
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-lg border border-red-800 px-4 text-sm text-red-400"
      >
        Supprimer la machine
      </button>
    </form>
  );
}

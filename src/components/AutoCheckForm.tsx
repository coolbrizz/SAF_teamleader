"use client";

export function AutoCheckForm({
  action,
  hidden,
  name,
  defaultChecked,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  name: string;
  defaultChecked: boolean;
  label: string;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="size-5 accent-[#F5C518]"
        />
        {label}
      </label>
    </form>
  );
}

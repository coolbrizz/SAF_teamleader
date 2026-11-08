"use client";

export function AutoCheckForm({
  action,
  hidden,
  name,
  defaultChecked,
  label,
  compact,
  className = "",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  name: string;
  defaultChecked: boolean;
  label: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <form action={action} className={`flex items-center gap-2 ${className}`}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label className={`flex items-center gap-2 text-sm ${compact ? "min-h-8" : "min-h-11"}`}>
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

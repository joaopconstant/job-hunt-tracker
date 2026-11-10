import { createApplication } from "@/app/actions";

const inputClass =
  "rounded border border-black/10 bg-transparent px-2 py-1 text-sm dark:border-white/10";

export function NewApplicationForm() {
  return (
    <form action={createApplication} className="flex flex-wrap items-end gap-2">
      <input name="company" placeholder="Company" aria-label="Company" required className={inputClass} />
      <input name="role" placeholder="Role" aria-label="Role" required className={inputClass} />
      <input name="location" placeholder="Location" aria-label="Location" className={inputClass} />
      <input name="url" type="url" placeholder="Job posting URL" aria-label="Job posting URL" className={inputClass} />
      <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white dark:bg-white dark:text-black">
        Add application
      </button>
    </form>
  );
}

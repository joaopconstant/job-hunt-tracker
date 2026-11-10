import { deleteApplication, moveApplication } from "@/app/actions";
import { STATUSES, STATUS_LABELS, type Application } from "@/lib/applications";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <article
      aria-label={`${application.role} at ${application.company}`}
      className="rounded-lg border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <h3 className="font-medium">{application.company}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{application.role}</p>
      {application.location && <p className="text-xs text-zinc-500">{application.location}</p>}
      {application.url && (
        <a href={application.url} target="_blank" rel="noreferrer" className="text-xs underline">
          Job posting
        </a>
      )}

      <div className="mt-3 flex items-center gap-2">
        <form action={moveApplication} className="flex items-center gap-1">
          <input type="hidden" name="id" value={application.id} />
          <label className="sr-only" htmlFor={`status-${application.id}`}>
            Status
          </label>
          <select
            id={`status-${application.id}`}
            name="status"
            defaultValue={application.status}
            className="rounded border border-black/10 bg-transparent px-1 py-0.5 text-xs dark:border-white/10"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button type="submit" className="text-xs underline">
            Move
          </button>
        </form>
        <form action={deleteApplication} className="ml-auto">
          <input type="hidden" name="id" value={application.id} />
          <button type="submit" className="text-xs text-red-600">
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}

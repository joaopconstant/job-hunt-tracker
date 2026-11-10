import { ApplicationCard } from "@/components/application-card";
import { STATUSES, STATUS_LABELS, groupByStatus, type Application } from "@/lib/applications";

export function Board({ applications }: { applications: Application[] }) {
  const columns = groupByStatus(applications);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {STATUSES.map((status) => (
        <section key={status} aria-labelledby={`column-${status}`} className="flex flex-col gap-2">
          <h2 id={`column-${status}`} className="text-sm font-semibold">
            {STATUS_LABELS[status]} <span className="text-zinc-500">({columns[status].length})</span>
          </h2>
          {columns[status].map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </section>
      ))}
    </div>
  );
}

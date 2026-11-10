import { ApplicationCard } from "@/components/application-card";
import { Badge } from "@/components/ui/badge";
import { STATUSES, STATUS_LABELS, groupByStatus, type Application } from "@/lib/applications";

export function Board({ applications }: { applications: Application[] }) {
  const columns = groupByStatus(applications);

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {STATUSES.map((status) => (
        <section
          key={status}
          aria-labelledby={`column-${status}`}
          className="flex flex-col gap-3 rounded-3xl bg-muted/50 p-3"
        >
          <h2 id={`column-${status}`} className="flex items-center justify-between px-1 font-heading text-sm font-medium">
            {STATUS_LABELS[status]}
            <Badge variant="secondary" aria-label={`${columns[status].length} applications`}>
              {columns[status].length}
            </Badge>
          </h2>
          {columns[status].map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </section>
      ))}
    </div>
  );
}

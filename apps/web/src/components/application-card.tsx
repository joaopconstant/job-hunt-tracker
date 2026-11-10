import Link from "next/link";
import { deleteApplication, moveApplication } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { STATUSES, STATUS_LABELS, type Application } from "@/lib/applications";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <Card size="sm" role="article" aria-label={`${application.role} at ${application.company}`}>
      <CardHeader>
        <CardTitle>
          <Link href={`/applications/${application.id}`} className="hover:underline underline-offset-4">
            {application.company}
          </Link>
        </CardTitle>
        <CardDescription>{application.role}</CardDescription>
        <CardAction>
          <form action={deleteApplication}>
            <input type="hidden" name="id" value={application.id} />
            <Button type="submit" variant="ghost" size="xs">
              Delete
            </Button>
          </form>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(application.location || application.url) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {application.location && <span>{application.location}</span>}
            {application.url && (
              <a href={application.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                Job posting
              </a>
            )}
          </div>
        )}
        <Link
          href={`/applications/${application.id}`}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Compare with résumé
        </Link>
        <form action={moveApplication} className="flex items-center gap-2">
          <input type="hidden" name="id" value={application.id} />
          <NativeSelect name="status" size="sm" defaultValue={application.status} aria-label="Status">
            {STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {STATUS_LABELS[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button type="submit" variant="outline" size="sm">
            Move
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import { StatusChart, WeeklyChart } from "@/components/charts";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES, STATUS_LABELS } from "@/lib/applications";
import { formatPercent, formatWeek, type Stats } from "@/lib/stats";

export function Dashboard({ stats }: { stats: Stats }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications sent" value={String(stats.submitted)} hint={`${stats.total} tracked in total`} />
        <StatCard label="Waiting on an answer" value={String(stats.active)} hint="Applied or interviewing" />
        <StatCard label="Interview rate" value={formatPercent(stats.interviewRate)} hint="Sent that reached interview or offer" />
        <StatCard label="Offer rate" value={formatPercent(stats.offerRate)} hint="Sent that got an offer" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Applications sent per week</h2>
            </CardTitle>
            <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart weekly={stats.weekly} />
            <table className="sr-only">
              <caption>Applications sent per week</caption>
              <thead>
                <tr>
                  <th scope="col">Week of</th>
                  <th scope="col">Applications</th>
                </tr>
              </thead>
              <tbody>
                {stats.weekly.map((week) => (
                  <tr key={week.weekStart}>
                    <td>{formatWeek(week.weekStart)}</td>
                    <td>{week.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Applications by status</h2>
            </CardTitle>
            <CardDescription>Where everything stands today</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart byStatus={stats.byStatus} />
            <table className="sr-only">
              <caption>Applications by status</caption>
              <thead>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Applications</th>
                </tr>
              </thead>
              <tbody>
                {STATUSES.map((status) => (
                  <tr key={status}>
                    <td>{STATUS_LABELS[status]}</td>
                    <td>{stats.byStatus[status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

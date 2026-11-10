import { createApplication } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  { name: "company", label: "Company", placeholder: "Acme", required: true },
  { name: "role", label: "Role", placeholder: "Full Stack Developer", required: true },
  { name: "location", label: "Location", placeholder: "Remote" },
  { name: "url", label: "Job posting URL", placeholder: "https://…", type: "url" },
];

export function NewApplicationForm() {
  return (
    <Card size="sm">
      <CardContent>
        <form action={createApplication} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
          {fields.map(({ name, label, ...props }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} name={name} {...props} />
            </div>
          ))}
          <Button type="submit">Add application</Button>
        </form>
      </CardContent>
    </Card>
  );
}

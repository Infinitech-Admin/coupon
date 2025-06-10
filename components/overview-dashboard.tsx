// components/overview-dashboard.tsx

import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/cards";
import { Badge } from "@/components/ui/badge";

export default function OverviewDashboard({
  range,
  employee,
}: {
  range: { from: Date; to: Date };
  employee: string;
}) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(
      `/api/overview?from=${range.from.toISOString()}&to=${range.to.toISOString()}&employee_id=${employee}`,
    )
      .then((res) => res.json())
      .then(setStats);
  }, [range, employee]);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Average Claims per Employee</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-semibold">
          {stats.avg_claims}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Most Active Employee</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-semibold">
          {stats.top_employee} <Badge>{stats.top_employee_claims}</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Least Active Department</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-semibold">
          {stats.least_active_department}
        </CardContent>
      </Card>
    </div>
  );
}

// components/employee-analytics.tsx

import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/cards";

export default function EmployeeAnalytics({
  range,
}: {
  range: { from: Date; to: Date };
}) {
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    fetch(
      `/api/employee-analytics?from=${range.from.toISOString()}&to=${range.to.toISOString()}`,
    )
      .then((res) => res.json())
      .then(setAnalytics);
  }, [range]);

  if (!analytics.length) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {analytics.map((emp, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle>{emp.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Claims: {emp.claims}</p>
            <p>Department: {emp.department}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

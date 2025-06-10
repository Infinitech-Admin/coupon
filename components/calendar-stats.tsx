import { CalendarIcon, Clock } from "lucide-react";

// Import the CalendarEvent type
interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  type: "work" | "important" | "personal";
  location?: string;
  reminder?: boolean;
  attendees?: string[];
}

// Define props interface for the component
interface CalendarStatsProps {
  events?: CalendarEvent[];
}

export function CalendarStats({ events = [] }: CalendarStatsProps) {
  // Calculate statistics based on events
  const totalEvents = events.length;
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(`${event.date}T${event.time}`);

    return eventDate > new Date();
  }).length;

  const workEvents = events.filter((event) => event.type === "work").length;
  const personalEvents = events.filter(
    (event) => event.type === "personal",
  ).length;
  const importantEvents = events.filter(
    (event) => event.type === "important",
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg">
          <CalendarIcon className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-blue-700">{totalEvents}</div>
          <div className="text-sm text-blue-600">Total Events</div>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg">
          <Clock className="h-8 w-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-green-700">
            {upcomingEvents}
          </div>
          <div className="text-sm text-green-600">Upcoming</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3">Event Types</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <span className="text-sm">Work</span>
            </div>
            <span className="text-sm font-medium">{workEvents}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-rose-500 mr-2" />
              <span className="text-sm">Important</span>
            </div>
            <span className="text-sm font-medium">{importantEvents}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2" />
              <span className="text-sm">Personal</span>
            </div>
            <span className="text-sm font-medium">{personalEvents}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-purple-700">Completion Rate</h3>
          <span className="text-sm text-purple-600">70%</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>
  );
}

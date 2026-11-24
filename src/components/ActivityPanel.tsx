import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Activity, CheckCircle2, Clock3, Inbox, XCircle, type LucideIcon } from "lucide-react";
import { formatDate, formatTime } from "../lib/utils";
import type { EventType, PunchEvent, SyncStatus } from "../lib/types";
import { useDemo } from "../state/useDemo";

type Filter = "all" | EventType;

const FILTERS: readonly { id: Filter; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All activity", icon: Activity },
  { id: "recorded", label: "Recorded", icon: CheckCircle2 },
  { id: "buffered", label: "Buffered", icon: Clock3 },
  { id: "denied", label: "Denied", icon: XCircle },
];

const EVENT_LABEL: Record<EventType, string> = {
  recorded: "Punch recorded",
  buffered: "Punch buffered",
  denied: "Access denied",
};

function SyncBadge({ type, status }: { type: EventType; status: SyncStatus }) {
  if (type === "denied") {
    return (
      <span className="sync-badge sync-denied">
        <XCircle size={13} strokeWidth={2} aria-hidden="true" />
        Logged
      </span>
    );
  }
  if (type === "buffered" && status === "pending") {
    return (
      <span className="sync-badge sync-pending">
        <Clock3 size={13} strokeWidth={2} aria-hidden="true" />
        Pending
      </span>
    );
  }
  return (
    <span className="sync-badge sync-synced">
      <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
      Synced
    </span>
  );
}

function EventRow({ event }: { event: PunchEvent }) {
  return (
    <tr>
      <td data-label="Employee">
        <div className="table-person">
          <span className={`table-avatar tone-${event.employeeId === "UNKNOWN" ? "neutral" : "blue"}`}>
            {event.employeeName === "Unknown Card" ? "?" : event.employeeName.slice(0, 1)}
          </span>
          <span>{event.employeeName}</span>
        </div>
      </td>
      <td data-label="Employee ID" className="numeric">
        <bdi>{event.employeeId}</bdi>
      </td>
      <td data-label="Department">{event.department}</td>
      <td data-label="Event">
        <span className={`event-type event-${event.type}`}>{EVENT_LABEL[event.type]}</span>
      </td>
      <td data-label="Timestamp" className="numeric">
        <span className="table-time">
          <span>{formatDate(event.timestamp)}</span>
          <span className="table-time-secondary">{formatTime(event.timestamp)}</span>
        </span>
      </td>
      <td data-label="Sync">
        <SyncBadge type={event.type} status={event.syncStatus} />
      </td>
    </tr>
  );
}

export function ActivityPanel() {
  const { state, recordedCount, bufferedCount, deniedCount } = useDemo();
  const [filter, setFilter] = useState<Filter>("all");

  const counts: Record<Filter, number> = useMemo(
    () => ({
      all: state.events.length,
      recorded: recordedCount,
      buffered: bufferedCount,
      denied: deniedCount,
    }),
    [state.events.length, recordedCount, bufferedCount, deniedCount],
  );

  const visibleEvents = useMemo(
    () => (filter === "all" ? state.events : state.events.filter((event) => event.type === filter)),
    [filter, state.events],
  );

  return (
    <div className="activity">
      <div className="metrics">
        {FILTERS.map((item) => {
          const MetricIcon = item.icon;
          return (
            <div key={item.id} className="metric">
              <span className="metric-value">{counts[item.id]}</span>
              <span className="metric-label">
                <MetricIcon className="metric-icon" size={15} strokeWidth={2} aria-hidden="true" />
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="activity-toolbar">
        <div className="filter-tabs" role="group" aria-label="Filter activity">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-tab ${filter === item.id ? "is-active" : ""}`}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {filter === item.id ? (
                <motion.span
                  layoutId="activity-filter-indicator"
                  className="filter-indicator"
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                />
              ) : null}
              <span className="filter-tab-label">{item.label}</span>
              <span className="filter-tab-count">{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <span className="activity-live">
          <span className="live-dot" aria-hidden="true" />
          Live updates
        </span>
      </div>

      <div className="table-wrap">
        <table className="activity-table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Employee ID</th>
              <th scope="col">Department</th>
              <th scope="col">Event</th>
              <th scope="col">Timestamp</th>
              <th scope="col">Sync</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>

        {visibleEvents.length === 0 ? (
          <div className="empty-state">
            <Inbox size={24} strokeWidth={1.5} aria-hidden="true" />
            <strong>No {filter === "all" ? "activity" : filter} events yet</strong>
            <span>Tap a card in the console to generate the first entry.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

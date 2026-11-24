import { Check, CreditCard } from "lucide-react";
import { EMPLOYEES } from "../lib/data";
import type { Employee } from "../lib/types";
import { useDemo } from "../state/useDemo";

function EmployeeCard({ employee }: { employee: Employee }) {
  const { state, selectEmployee } = useDemo();
  const selected = state.selectedEmployeeId === employee.id;

  return (
    <button
      type="button"
      className={`credential-card tone-${employee.tone} ${selected ? "is-selected" : ""}`}
      aria-pressed={selected}
      onClick={() => selectEmployee(employee.id)}
    >
      <span className="credential-top">
        <span className="credential-mark">{employee.initials}</span>
        <CreditCard size={16} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <span className="credential-name">{employee.name}</span>
      <span className="credential-id">{employee.id}</span>
      <span className="credential-bottom">
        <span className="credential-department">
          <span className="tone-dot" aria-hidden="true" />
          {employee.department}
        </span>
        {selected ? <Check size={15} strokeWidth={2.2} aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

export function CardPicker() {
  return (
    <div className="credential-grid">
      {EMPLOYEES.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}

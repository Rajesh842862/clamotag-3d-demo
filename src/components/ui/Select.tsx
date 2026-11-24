import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  label: string;
  id: string;
}

export function SelectField({ value, onValueChange, options, label, id }: SelectFieldProps) {
  return (
    <div className="select-field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger id={id} className="select-trigger" aria-label={label}>
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon asChild>
            <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="select-content" position="popper" sideOffset={6}>
            <SelectPrimitive.Viewport className="select-viewport">
              {options.map((option) => (
                <SelectPrimitive.Item key={option.value} value={option.value} className="select-item">
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  {option.hint ? <span className="select-item-hint">{option.hint}</span> : null}
                  <SelectPrimitive.ItemIndicator className="select-item-indicator">
                    <Check size={14} strokeWidth={2} aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

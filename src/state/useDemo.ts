import { useContext } from "react";
import { DemoContext, type DemoApi } from "./context";

export function useDemo(): DemoApi {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}

import { useEffect, useState } from "react";

export function useFormDirty(initialValues: Record<string, unknown>) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const markDirty = () => setIsDirty(true);
  const markClean = () => setIsDirty(false);

  return { isDirty, markDirty, markClean };
}

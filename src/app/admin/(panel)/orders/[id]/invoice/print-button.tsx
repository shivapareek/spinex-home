"use client";

import { Printer } from "@phosphor-icons/react";
import { buttonClass } from "@/components/admin/ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("primary")}>
      <Printer weight="light" className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}

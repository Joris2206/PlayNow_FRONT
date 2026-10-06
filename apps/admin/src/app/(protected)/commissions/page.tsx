"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import CommissionPlansSection from "@/components/commissions/commission-plans-section";
import CommissionPreviewSection from "@/components/commissions/commission-preview-section";
import CommissionSettlementsSection from "@/components/commissions/commission-settlements-section";
import PageHeader from "@/components/shared/page-header";
import { hasAccess } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import type { CommissionSettlement } from "@/types/commission";

type CommissionTab = "settlements" | "preview" | "plans";

const TABS: ReadonlyArray<{ id: CommissionTab; label: string }> = [
  { id: "settlements", label: "Liquidaciones" },
  { id: "preview", label: "Vista previa" },
  { id: "plans", label: "Planes" },
];

export default function CommissionsPage() {
  const {
    activeBusinessPublicId: businessPublicId,
    isLoading,
    isPlatformAdmin,
    role,
  } = useAuth();
  const canAccess = hasAccess(role ?? undefined, "commissions", isPlatformAdmin);
  const [activeTab, setActiveTab] =
    useState<CommissionTab>("settlements");
  const [settlementNotice, setSettlementNotice] = useState("");

  useEffect(() => {
    setActiveTab("settlements");
    setSettlementNotice("");
  }, [businessPublicId]);

  if (!isLoading && !canAccess) {
    return (
      <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-white">
            Acceso no disponible
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Tu rol no tiene permiso para consultar o administrar comisiones.
          </p>
        </div>
      </div>
    );
  }

  function handleSettlementCreated(settlement: CommissionSettlement) {
    setSettlementNotice(
      `Liquidación de ${settlement.employee_name} creada correctamente.`
    );
    setActiveTab("settlements");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        title="Comisiones"
        description="Configura planes, consulta comisiones y administra liquidaciones del negocio activo."
      />
      <div
        role="tablist"
        aria-label="Secciones de comisiones"
        className="flex flex-wrap gap-2 border-b border-white/10 pb-3"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`commissions-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`commissions-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-red-500",
              activeTab === tab.id
                ? "bg-red-500 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`commissions-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`commissions-tab-${activeTab}`}
      >
        {activeTab === "settlements" && (
          <CommissionSettlementsSection
            businessPublicId={canAccess ? businessPublicId : undefined}
            notice={settlementNotice}
            onNoticeDismiss={() => setSettlementNotice("")}
          />
        )}
        {activeTab === "preview" && (
          <CommissionPreviewSection
            businessPublicId={canAccess ? businessPublicId : undefined}
            onSettlementCreated={handleSettlementCreated}
          />
        )}
        {activeTab === "plans" && (
          <CommissionPlansSection
            businessPublicId={canAccess ? businessPublicId : undefined}
          />
        )}
      </div>
    </div>
  );
}

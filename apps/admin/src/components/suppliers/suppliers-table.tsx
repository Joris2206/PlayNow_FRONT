import { Truck } from "lucide-react";
import { getCatalogStatusClassName } from "@/lib/catalog-status";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Supplier } from "@/types/supplier";

export default function SuppliersTable({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) return <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center"><Truck className="h-7 w-7 text-zinc-600" /><h3 className="mt-3 font-medium text-white">No hay proveedores</h3><p className="mt-2 text-sm text-zinc-500">No encontramos proveedores que coincidan con la búsqueda.</p></div>;
  return <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"><Table className="min-w-[720px]"><TableHeader className="bg-white/[0.02]"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="px-5 text-zinc-500">Proveedor</TableHead><TableHead className="px-5 text-zinc-500">Teléfono</TableHead><TableHead className="px-5 text-zinc-500">Correo</TableHead><TableHead className="px-5 text-zinc-500">Estado</TableHead></TableRow></TableHeader><TableBody>{suppliers.map((supplier) => <TableRow key={supplier.public_id} className="border-white/10 hover:bg-white/[0.025]"><TableCell className="px-5 font-medium text-white">{supplier.name}</TableCell><TableCell className="px-5 text-zinc-400">{supplier.phone}</TableCell><TableCell className="px-5 text-zinc-400">{supplier.email || "Sin correo"}</TableCell><TableCell className="px-5"><span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getCatalogStatusClassName(supplier.status_name))}>{supplier.status_name}</span></TableCell></TableRow>)}</TableBody></Table></div>;
}

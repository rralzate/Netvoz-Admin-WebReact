import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Badge } from "@/core/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/core/ui/dialog";
import { cn } from "@/core/utils";
import apiClient from "@/core/api/apiClient";

interface BusinessEntity {
	id: string;
	nombre: string;
	email?: string;
	nit?: string;
	active: boolean;
	createdAt?: string;
}

interface GetAllBusinessesResponse {
	data: BusinessEntity[];
	total?: number;
}

interface PurgeResult {
	deletedCounts: Record<string, number>;
	total: number;
}

async function fetchAllNegocios(): Promise<BusinessEntity[]> {
	const response = await apiClient.get<GetAllBusinessesResponse>({
		url: "/business",
		config: { params: { limit: 500 } },
	});
	return response?.data ?? [];
}

async function purgeNegocio(id: string): Promise<PurgeResult> {
	const response = await apiClient.delete<{ data: PurgeResult }>({
		url: `/business/${id}/purge`,
	});
	return (response as any)?.data ?? response;
}

function formatDate(dateString?: string): string {
	if (!dateString) return "—";
	try {
		return new Date(dateString).toLocaleDateString("es-CO", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch {
		return dateString;
	}
}

export function NegociosPage() {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedNegocio, setSelectedNegocio] = useState<BusinessEntity | null>(null);
	const [confirmName, setConfirmName] = useState("");
	const [purgeResult, setPurgeResult] = useState<PurgeResult | null>(null);

	const { data: negocios = [], isLoading, error, refetch } = useQuery({
		queryKey: ["negocios", "all"],
		queryFn: fetchAllNegocios,
		staleTime: 60 * 1000,
	});

	const purgeMutation = useMutation({
		mutationFn: (id: string) => purgeNegocio(id),
		onSuccess: (result) => {
			setPurgeResult(result);
			queryClient.invalidateQueries({ queryKey: ["negocios"] });
		},
	});

	const filtered = negocios.filter((n) => {
		const q = searchTerm.toLowerCase();
		return (
			n.nombre?.toLowerCase().includes(q) ||
			n.email?.toLowerCase().includes(q) ||
			n.nit?.toLowerCase().includes(q)
		);
	});

	const handlePurgeClick = (negocio: BusinessEntity) => {
		setSelectedNegocio(negocio);
		setConfirmName("");
		setPurgeResult(null);
		purgeMutation.reset();
	};

	const handleConfirmPurge = () => {
		if (selectedNegocio) {
			purgeMutation.mutate(selectedNegocio.id);
		}
	};

	const handleCloseDialog = () => {
		setSelectedNegocio(null);
		setConfirmName("");
		setPurgeResult(null);
		purgeMutation.reset();
	};

	const canConfirm =
		confirmName.trim().toLowerCase() === selectedNegocio?.nombre?.trim().toLowerCase();

	if (isLoading) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
				<span>Cargando negocios...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
					<p>Error al cargar los negocios</p>
					<Button variant="outline" className="mt-2" onClick={() => refetch()}>
						Reintentar
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">Negocios</h1>
					<p className="text-muted-foreground mt-1">
						Gestión y limpieza de datos de negocios registrados
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					<Icon icon="lucide:refresh-cw" className="mr-2 h-4 w-4" />
					Actualizar
				</Button>
			</div>

			{/* Warning banner */}
			<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
				<Icon icon="lucide:alert-triangle" className="text-amber-600 shrink-0 mt-0.5" size={18} />
				<p className="text-sm text-amber-800">
					<strong>Zona de administración.</strong> La operación "Purgar" elimina
					permanentemente todos los datos de un negocio (órdenes, productos, clientes,
					documentos, usuarios, etc.). Esta acción es <strong>irreversible</strong>.
					Úsala solo cuando un negocio nunca arrancó y se quiere limpiar completamente la base de datos.
				</p>
			</div>

			{/* Search */}
			<div className="mb-4">
				<div className="relative max-w-md">
					<Icon
						icon="lucide:search"
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						size={18}
					/>
					<Input
						placeholder="Buscar por nombre, email o NIT..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card rounded-lg border shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[700px]">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="text-left p-4 font-medium text-muted-foreground text-sm">NEGOCIO</th>
								<th className="text-left p-4 font-medium text-muted-foreground text-sm">NIT</th>
								<th className="text-left p-4 font-medium text-muted-foreground text-sm">ESTADO</th>
								<th className="text-left p-4 font-medium text-muted-foreground text-sm">CREADO</th>
								<th className="text-left p-4 font-medium text-muted-foreground text-sm">ACCIONES</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((negocio) => (
								<tr
									key={negocio.id}
									className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
								>
									<td className="p-4">
										<div>
											<p className="font-medium">{negocio.nombre || "Sin nombre"}</p>
											<p className="text-sm text-muted-foreground">{negocio.email || "—"}</p>
										</div>
									</td>
									<td className="p-4 text-sm text-muted-foreground">
										{negocio.nit || "—"}
									</td>
									<td className="p-4">
										<Badge
											variant="outline"
											className={cn(
												"font-medium",
												negocio.active
													? "bg-green-100 text-green-800 border-green-200"
													: "bg-gray-100 text-gray-600 border-gray-200"
											)}
										>
											{negocio.active ? "Activo" : "Inactivo"}
										</Badge>
									</td>
									<td className="p-4 text-sm text-muted-foreground">
										{formatDate(negocio.createdAt)}
									</td>
									<td className="p-4">
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handlePurgeClick(negocio)}
										>
											<Icon icon="lucide:trash-2" className="mr-1.5 h-3.5 w-3.5" />
											Purgar
										</Button>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={5} className="p-8 text-center text-muted-foreground">
										{searchTerm
											? "No se encontraron negocios con ese criterio"
											: "No hay negocios registrados"}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="px-4 py-3 border-t text-sm text-muted-foreground">
					{filtered.length} negocio{filtered.length !== 1 ? "s" : ""}
					{searchTerm ? " (filtrados)" : " en total"}
				</div>
			</div>

			{/* Purge confirmation dialog */}
			<Dialog open={!!selectedNegocio} onOpenChange={(open) => !open && handleCloseDialog()}>
				<DialogContent className="max-w-lg">
					{purgeResult ? (
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2 text-green-700">
									<Icon icon="lucide:check-circle" size={20} />
									Purga completada
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-3">
								<p className="text-sm text-muted-foreground">
									Se eliminaron <strong>{purgeResult.total}</strong> documentos del negocio{" "}
									<strong>{selectedNegocio?.nombre}</strong>.
								</p>
								{Object.keys(purgeResult.deletedCounts).length > 0 && (
									<div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto">
										<p className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Detalle por colección</p>
										<div className="space-y-1">
											{Object.entries(purgeResult.deletedCounts).map(([col, count]) => (
												<div key={col} className="flex justify-between text-sm">
													<span className="font-mono text-xs text-muted-foreground">{col}</span>
													<span className="font-semibold">{count}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
							<DialogFooter>
								<Button onClick={handleCloseDialog}>Cerrar</Button>
							</DialogFooter>
						</>
					) : (
						<>
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2 text-red-700">
									<Icon icon="lucide:alert-triangle" size={20} />
									Purgar negocio — acción irreversible
								</DialogTitle>
								<DialogDescription>
									Esta operación eliminará <strong>permanentemente</strong> todos los datos
									del negocio <strong>{selectedNegocio?.nombre}</strong> de todas las
									colecciones de la base de datos. No se puede deshacer.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
									<p className="font-semibold mb-1">Se eliminarán:</p>
									<p>Órdenes · Documentos · Productos · Clientes · Usuarios · Cajas · Inventario · Configuración DIAN · y todos los demás datos asociados.</p>
								</div>

								<div>
									<p className="text-sm mb-2">
										Para confirmar, escribe el nombre del negocio:{" "}
										<strong>{selectedNegocio?.nombre}</strong>
									</p>
									<Input
										value={confirmName}
										onChange={(e) => setConfirmName(e.target.value)}
										placeholder="Escribe el nombre exacto..."
										autoFocus
									/>
								</div>

								{purgeMutation.isError && (
									<div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
										Error al purgar:{" "}
										{purgeMutation.error instanceof Error
											? purgeMutation.error.message
											: "Error desconocido"}
									</div>
								)}
							</div>

							<DialogFooter className="gap-2">
								<Button variant="outline" onClick={handleCloseDialog} disabled={purgeMutation.isPending}>
									Cancelar
								</Button>
								<Button
									variant="destructive"
									onClick={handleConfirmPurge}
									disabled={!canConfirm || purgeMutation.isPending}
								>
									{purgeMutation.isPending ? (
										<>
											<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
											Purgando...
										</>
									) : (
										<>
											<Icon icon="lucide:trash-2" className="mr-2 h-4 w-4" />
											Purgar permanentemente
										</>
									)}
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default NegociosPage;

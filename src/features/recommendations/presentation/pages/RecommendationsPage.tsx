import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/core/utils";
import type { RecommendationEstado } from "../../domain/entities/RecommendationEntity";
import { useRecommendations } from "../hooks/useRecommendations";
import { ModalUpdateRecommendationStatus } from "../components/ModalUpdateRecommendationStatus";

const estadoOptions: { key: RecommendationEstado | null; label: string }[] = [
	{ key: null, label: "Todos" },
	{ key: "enviada", label: "Enviada" },
	{ key: "pendiente", label: "Pendiente" },
	{ key: "contactado", label: "Contactado" },
	{ key: "en_espera", label: "En espera" },
	{ key: "registrado", label: "Registrado" },
	{ key: "pago", label: "Pago" },
	{ key: "cancelada", label: "Cancelada" },
];

const estadoColors: Record<RecommendationEstado, string> = {
	enviada: "bg-slate-100 text-slate-800 border-slate-200",
	pendiente: "bg-amber-100 text-amber-800 border-amber-200",
	contactado: "bg-blue-100 text-blue-800 border-blue-200",
	en_espera: "bg-orange-100 text-orange-800 border-orange-200",
	cancelada: "bg-red-100 text-red-800 border-red-200",
	registrado: "bg-cyan-100 text-cyan-800 border-cyan-200",
	pago: "bg-green-100 text-green-800 border-green-200",
};

function formatDate(value: string | undefined | null): string {
	if (!value) return "—";
	return new Date(value).toLocaleDateString("es-CO", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function RecommendationsPage() {
	const { t } = useTranslation();
	const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const {
		recommendations,
		isLoading,
		error,
		filterEstado,
		setFilterEstado,
		loadRecommendations,
		updateStatus,
	} = useRecommendations({ adminMode: true });

	const handleUpdateStatus = async (
		id: string,
		data: { estado: "contactado" | "en_espera" | "cancelada"; motivoCancelacion?: string; comentariosSeguimiento?: string }
	) => {
		const updated = await updateStatus(id, data);
		if (updated) {
			setModalOpen(false);
			setSelectedRecommendation(null);
		}
	};

	if (isLoading && recommendations.length === 0) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[400px]">
				<Icon icon="lucide:loader-2" className="animate-spin mr-2" size={24} />
				<span>{t("common.loading", "Cargando...")}</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between">
					<span>{error}</span>
					<Button variant="outline" size="sm" onClick={loadRecommendations}>
						{t("common.retry", "Reintentar")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold">
						{t("recommendations.title", "Recomendaciones")}
					</h1>
					<p className="text-muted-foreground mt-1">
						{t("recommendations.description", "Seguimiento de invitaciones (Recomienda y gana). Contacta al invitado y actualiza el estado.")}
					</p>
				</div>
			</div>

			{/* Filtros por estado */}
			<div className="flex flex-wrap gap-2 mb-4">
				{estadoOptions.map(({ key, label }) => (
					<Button
						key={label}
						variant={filterEstado === key ? "default" : "outline"}
						size="sm"
						onClick={() => setFilterEstado(key)}
					>
						{label}
					</Button>
				))}
			</div>

			<div className="bg-card rounded-lg border overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b bg-muted/50">
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">INVITADO</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">EMAIL / TELÉFONO</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">NEGOCIO</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">ESTADO</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">COMENTARIOS</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">FECHA</th>
								<th className="text-left p-3 font-medium text-muted-foreground text-sm">ACCIÓN</th>
							</tr>
						</thead>
						<tbody>
							{recommendations.map((rec) => (
								<tr key={rec.id} className="border-b last:border-b-0">
									<td className="p-3">
										<span className="font-medium">
											{rec.recomendadoNombre || "—"}
										</span>
									</td>
									<td className="p-3 text-sm text-muted-foreground">
										{rec.recomendadoEmail && <div>{rec.recomendadoEmail}</div>}
										{rec.recomendadoTelefono && <div>{rec.recomendadoTelefono}</div>}
										{!rec.recomendadoEmail && !rec.recomendadoTelefono && "—"}
									</td>
									<td className="p-3 text-sm">{rec.nombreNegocio || "—"}</td>
									<td className="p-3">
										<Badge
											variant="outline"
											className={cn("text-xs", estadoColors[rec.estado] ?? "bg-gray-100 text-gray-800 border-gray-200")}
										>
											{rec.estado}
										</Badge>
									</td>
									<td className="p-3 text-sm max-w-[220px]">
										{rec.comentariosSeguimiento ? (
											<span
												title={rec.comentariosSeguimiento}
												className="line-clamp-2 text-muted-foreground"
											>
												{rec.comentariosSeguimiento}
											</span>
										) : rec.motivoCancelacion ? (
											<span
												title={rec.motivoCancelacion}
												className="line-clamp-2 text-muted-foreground italic"
											>
												{rec.motivoCancelacion}
											</span>
										) : (
											"—"
										)}
									</td>
									<td className="p-3 text-sm text-muted-foreground">
										{formatDate(rec.createdAt)}
									</td>
									<td className="p-3">
										{["pendiente", "contactado", "en_espera", "enviada"].includes(rec.estado) && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedRecommendation(rec);
													setModalOpen(true);
												}}
											>
												<Icon icon="lucide:user-check" className="mr-1 h-3.5 w-3.5" />
												Seguimiento
											</Button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{recommendations.length === 0 && (
					<div className="text-center py-12 text-muted-foreground">
						<Icon icon="lucide:users-round" className="mx-auto mb-2 h-10 w-10 opacity-50" />
						<p>{t("recommendations.empty", "No hay recomendaciones con este filtro.")}</p>
					</div>
				)}
			</div>

			<ModalUpdateRecommendationStatus
				isOpen={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setSelectedRecommendation(null);
				}}
				recommendation={selectedRecommendation}
				onConfirm={handleUpdateStatus}
			/>
		</div>
	);
}

export default RecommendationsPage;

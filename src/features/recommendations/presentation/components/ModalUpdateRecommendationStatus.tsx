import { useState, useEffect } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { Label } from "@/core/ui/label";
import { Textarea } from "@/core/ui/textarea";
import type { RecommendationEntity, RecommendationUpdateStatusRequest } from "../../domain/entities/RecommendationEntity";

type StatusOption = "contactado" | "en_espera" | "cancelada";

const statusLabels: Record<StatusOption, string> = {
	contactado: "Contactado",
	en_espera: "En espera",
	cancelada: "Cancelada",
};

interface ModalUpdateRecommendationStatusProps {
	isOpen: boolean;
	onClose: () => void;
	recommendation: RecommendationEntity | null;
	onConfirm: (id: string, data: RecommendationUpdateStatusRequest) => Promise<void>;
}

export function ModalUpdateRecommendationStatus({
	isOpen,
	onClose,
	recommendation,
	onConfirm,
}: ModalUpdateRecommendationStatusProps) {
	const [estado, setEstado] = useState<StatusOption>("contactado");
	const [motivoCancelacion, setMotivoCancelacion] = useState("");
	const [comentariosSeguimiento, setComentariosSeguimiento] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen && recommendation) {
			setEstado((recommendation.estado === "contactado" || recommendation.estado === "en_espera" || recommendation.estado === "cancelada")
				? recommendation.estado
				: "contactado");
			setMotivoCancelacion(recommendation.motivoCancelacion ?? "");
			setComentariosSeguimiento(recommendation.comentariosSeguimiento ?? "");
		}
	}, [isOpen, recommendation]);

	const handleSubmit = async () => {
		if (!recommendation) return;
		setIsSubmitting(true);
		try {
			await onConfirm(recommendation.id, {
				estado,
				...(motivoCancelacion.trim() && { motivoCancelacion: motivoCancelacion.trim() }),
				...(comentariosSeguimiento.trim() && { comentariosSeguimiento: comentariosSeguimiento.trim() }),
			});
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!recommendation) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="lucide:user-check" className="h-5 w-5 text-primary" />
						Actualizar seguimiento
					</DialogTitle>
					<DialogDescription>
						Invitation a <strong>{recommendation.recomendadoNombre || recommendation.recomendadoEmail || "—"}</strong>.
						Cambia el estado según el contacto realizado.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label>Nuevo estado</Label>
						<div className="flex flex-wrap gap-2">
							{(["contactado", "en_espera", "cancelada"] as const).map((opt) => (
								<Button
									key={opt}
									type="button"
									variant={estado === opt ? "default" : "outline"}
									size="sm"
									onClick={() => setEstado(opt)}
								>
									{statusLabels[opt]}
								</Button>
							))}
						</div>
					</div>

					{estado === "cancelada" && (
						<div className="space-y-2">
							<Label htmlFor="motivo">Motivo de cancelación (recomendado)</Label>
							<Textarea
								id="motivo"
								placeholder="Ej: No le interesa el servicio, prefiere que lo contacten después..."
								value={motivoCancelacion}
								onChange={(e) => setMotivoCancelacion(e.target.value)}
								rows={2}
							/>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="comentarios">Comentarios de seguimiento</Label>
						<Textarea
							id="comentarios"
							placeholder="Ej: Llamado el 10/03, pidió que lo contacten la próxima semana"
							value={comentariosSeguimiento}
							onChange={(e) => setComentariosSeguimiento(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
								Guardando...
							</>
						) : (
							"Guardar"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ModalUpdateRecommendationStatus;

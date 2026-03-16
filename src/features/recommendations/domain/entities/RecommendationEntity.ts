/**
 * Estados de la recomendación según el flujo del diagrama y API:
 * enviada → pendiente → contactado → registrado → pago
 * Cualquier momento: en_espera | cancelada (con motivo)
 */
export type RecommendationEstado =
	| "enviada"
	| "pendiente"
	| "contactado"
	| "en_espera"
	| "cancelada"
	| "registrado"
	| "pago";

export interface RecommendationEntity {
	id: string;
	negocioId: string;
	usuarioId: string;
	recomendadoNombre?: string;
	recomendadoEmail?: string;
	recomendadoTelefono?: string;
	aceptaTratamientoDatos: boolean;
	nombreNegocio?: string;
	estado: RecommendationEstado;
	motivoCancelacion?: string;
	comentariosSeguimiento?: string;
	usuarioCreadoId?: string;
	negocioCreadoId?: string;
	fechaAceptacionDatos?: string;
	fechaContactado?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface RecommendationListResponse {
	data: RecommendationEntity[];
	total?: number;
	page?: number;
	pageSize?: number;
}

/** Body para crear recomendación (POST /recommendations) */
export interface RecommendationCreateRequest {
	recomendadoNombre?: string;
	recomendadoEmail?: string;
	recomendadoTelefono?: string;
	aceptaTratamientoDatos: boolean;
	nombreNegocio?: string;
}

/** Body para actualizar estado (PATCH /recommendations/:id/status) */
export interface RecommendationUpdateStatusRequest {
	estado: "contactado" | "en_espera" | "cancelada";
	motivoCancelacion?: string;
	comentariosSeguimiento?: string;
}

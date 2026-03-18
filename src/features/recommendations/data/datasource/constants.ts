/** Rutas del API de recomendaciones (Postman RECOMMENDATIONS) */
export const recommendationUrls = {
	/** Lista del negocio del usuario autenticado. Query: estado */
	list: "/recommendations",
	/** Lista todas (solo admin). Query: estado */
	adminAll: "/recommendations/admin/all",
	/** Por ID */
	byId: (id: string) => `/recommendations/${id}`,
	/** Actualizar estado: contactado | en_espera | cancelada */
	status: (id: string) => `/recommendations/${id}/status`,
	markRegistered: "/recommendations/mark-registered",
	markPaid: "/recommendations/mark-paid",
};

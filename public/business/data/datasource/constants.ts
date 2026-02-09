/**
 * URLs de los endpoints de negocio.
 *
 * IMPORTANTE: Para obtener el negocio después del login, siempre usar:
 * - getBusinessByNegocioId: "/business/get-business-by-business" (RECOMENDADO)
 *
 * Este endpoint:
 * - No requiere parámetros (usa el negocioId del token)
 * - Siempre devuelve el negocio correcto del usuario autenticado
 * - Es más seguro y confiable
 *
 * NO usar endpoints por email (ej: "/business/email/:email") ya que pueden
 * causar inconsistencias si el email del usuario no coincide exactamente con el del negocio.
 */
export const urlsBusiness = {
	getBusinessById: "/business/:id",
	getBusinessByNegocioId: "/business/get-business-by-business/:negocioId",
	createBusiness: "/business",
	updateBusiness: "/business/:id",
	deleteBusiness: "/business/:id",
	uploadLogo: "/business/upload-logo",
} as const;

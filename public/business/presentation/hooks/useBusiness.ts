import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { container } from "@/core/di/DIContainer";
import { useAuthState } from "@/features/auth/presentation/hooks/userStore";
import { useLocation } from "@/features/location/presentation/hooks/useLocation";
import { TOKENS_BUSINESS } from "../../di/business.container.config";
import type { BusinessFormData, UpdateBusinessDTO } from "../../domain/interfaces/Business.Interfaces";
import type { GetBusinessUseCase } from "../../domain/usecases/GetBusinessUseCase";
import type { UpdateBusinessUseCase } from "../../domain/usecases/UpdateBusinessUseCase";
import type { UploadLogoUseCase } from "../../domain/usecases/UploadLogoUseCase";

// Constante para la key del localStorage
const LOGO_BASE64_KEY = "business_logo_base64";

/**
 * Convierte una URL de imagen a base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		const blob = await response.blob();

		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("Error converting image to base64:", error);
		throw error;
	}
}

/**
 * Hook para obtener y gestionar los datos del negocio del usuario autenticado.
 *
 * IMPORTANTE: Este hook usa el endpoint correcto `/business/get-business-by-business`
 * que obtiene el negocio usando el negocioId del token del usuario autenticado.
 *
 * NO usar endpoints por email (ej: `/business/email/:email`) ya que pueden causar
 * inconsistencias si el email del usuario no coincide exactamente con el del negocio.
 *
 * El endpoint recomendado siempre es `/business/get-business-by-business` porque:
 * - No requiere parámetros (usa el negocioId del token)
 * - Siempre devuelve el negocio correcto del usuario autenticado
 * - Es más seguro y confiable
 */
export function useBusiness() {
	const { userInfo } = useAuthState();
	const queryClient = useQueryClient();
	const [isUploadingLogo, setIsUploadingLogo] = useState(false);
	const [logoBase64, setLogoBase64] = useState<string | null>(null);
	const [isConvertingLogo, setIsConvertingLogo] = useState(false);
	const { countries } = useLocation();

	const negocioId = userInfo?.negocioId || "";

	// Get business query - usa GetBusinessUseCase que llama a getBusinessByNegocioId()
	const {
		data: business,
		isLoading: businessLoading,
		error: businessError,
		refetch: refetchBusiness,
	} = useQuery({
		queryKey: ["business", negocioId],
		queryFn: async () => {
			if (!negocioId) {
				return null;
			}
			try {
				const useCase = container.get<GetBusinessUseCase>(TOKENS_BUSINESS.GetBusinessUseCase);

				const result = await useCase.execute(negocioId);
				return result;
			} catch (error) {
				console.error("Error in query function:", error);
				throw error;
			}
		},
		enabled: !!negocioId,
	});

	// Efecto para convertir y guardar el logo en base64
	useEffect(() => {
		const convertAndSaveLogo = async () => {
			// Si no hay business o no hay logoUrl, limpiar el localStorage
			if (!business?.logoUrl) {
				localStorage.removeItem(LOGO_BASE64_KEY);
				setLogoBase64(null);
				return;
			}

			// Verificar si ya existe en localStorage
			const storedBase64 = localStorage.getItem(LOGO_BASE64_KEY);

			if (storedBase64) {
				setLogoBase64(storedBase64);
				return;
			}

			// Si no existe, convertir la URL a base64
			setIsConvertingLogo(true);
			try {
				const base64 = await imageUrlToBase64(business.logoUrl);
				localStorage.setItem(LOGO_BASE64_KEY, base64);
				setLogoBase64(base64);
			} catch (error) {
				console.error("Error converting logo to base64:", error);
			} finally {
				setIsConvertingLogo(false);
			}
		};

		convertAndSaveLogo();
	}, [business?.logoUrl]);

	// Update business mutation
	const updateBusinessMutation = useMutation({
		mutationFn: async ({ id, businessData }: { id: string; businessData: UpdateBusinessDTO }) => {
			const useCase = container.get<UpdateBusinessUseCase>(TOKENS_BUSINESS.UpdateBusinessUseCase);
			return await useCase.execute(id, businessData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["business", negocioId] });
		},
	});

	// Upload logo mutation
	const uploadLogoMutation = useMutation({
		mutationFn: async ({ logoFile, previousLogoUrl }: { logoFile: File; previousLogoUrl?: string }) => {
			const useCase = container.get<UploadLogoUseCase>(TOKENS_BUSINESS.UploadLogoUseCase);
			return await useCase.execute(logoFile, previousLogoUrl);
		},
		onSuccess: () => {
			// Limpiar el base64 guardado para forzar la reconversión
			localStorage.removeItem(LOGO_BASE64_KEY);
			queryClient.invalidateQueries({ queryKey: ["business", negocioId] });
		},
	});

	// Helper functions
	const updateBusiness = useCallback(
		async (id: string, businessData: UpdateBusinessDTO) => {
			return await updateBusinessMutation.mutateAsync({ id, businessData });
		},
		[updateBusinessMutation],
	);

	const uploadLogo = useCallback(
		async (logoFile: File, previousLogoUrl?: string) => {
			setIsUploadingLogo(true);
			try {
				const logoUrl = await uploadLogoMutation.mutateAsync({ logoFile, previousLogoUrl });
				return logoUrl;
			} finally {
				setIsUploadingLogo(false);
			}
		},
		[uploadLogoMutation],
	);

	// Función para limpiar el logo del localStorage
	const clearLogoCache = useCallback(() => {
		localStorage.removeItem(LOGO_BASE64_KEY);
		setLogoBase64(null);
	}, []);

	// Transform business data to form data
	const formData = useMemo((): BusinessFormData | null => {
		if (!business) {
			return null;
		}

		const data: BusinessFormData = {
			nombre: business.nombre,
			nit: business.nit,
			contacto: business.contacto,
			email: business.email,
			direccion: business.direccion,
			residencia: business.residencia,
			telefono: business.telefono,
			paginaWeb: business.paginaWeb || "",
			configuracion: business.configuracion,
			facturacionElectronica: business.facturacionElectronica,
		};
		return data;
	}, [business]);

	// Memoized getter function for backward compatibility
	const getFormData = useCallback((): BusinessFormData | null => {
		return formData;
	}, [formData]);

	// Transform form data to update DTO
	const getUpdateDTO = useCallback(
		(formData: BusinessFormData, departments?: any[], cities?: any[]): UpdateBusinessDTO => {
			// Find country name by code
			const selectedCountry = countries?.find((country) => country.codigo === formData.residencia.pais.codigo);

			// Find department name by code
			const selectedDepartment = departments?.find((dept) => dept.codigo === formData.residencia.departamento?.codigo);

			// Find city name by code
			const selectedCity = cities?.find((city) => city.codigo === formData.residencia.ciudad?.codigo);

			// Ensure country name is always provided - use business current name as fallback
			const countryNombre =
				selectedCountry?.nombre ||
				(formData.residencia.pais.nombre && formData.residencia.pais.nombre.trim() !== ""
					? formData.residencia.pais.nombre
					: business?.residencia.pais.nombre) ||
				"";

			return {
				nombre: formData.nombre,
				nit: formData.nit,
				contacto: formData.contacto,
				email: formData.email,
				direccion: formData.direccion,
				residencia: {
					pais: {
						codigo: formData.residencia.pais.codigo,
						nombre: countryNombre,
					},
					departamento: formData.residencia.departamento
						? {
								codigo: formData.residencia.departamento.codigo,
								nombre: selectedDepartment?.nombre || formData.residencia.departamento.nombre,
							}
						: undefined,
					ciudad: formData.residencia.ciudad
						? {
								codigo: formData.residencia.ciudad.codigo,
								nombre: selectedCity?.nombre || formData.residencia.ciudad.nombre,
							}
						: undefined,
				},
				telefono: formData.telefono,
				paginaWeb: formData.paginaWeb || undefined,
				configuracion: {
					productosConIngredientes: formData.configuracion.productosConIngredientes,
					utilizoMesas: formData.configuracion.utilizoMesas,
					envioADomicilio: formData.configuracion.envioADomicilio,
					imprimirComanda: formData.configuracion.imprimirComanda,
					costosEnvio: business?.configuracion.costosEnvio || [],
					moneda: business?.configuracion.moneda || { simbolo: "$", cantidadDecimales: 2 },
					objetivos: business?.configuracion.objetivos || {
						facturadoHoy: 0,
						ultimos7Dias: 0,
						ultimos30Dias: 0,
						anioActual: 0,
					},
				},
				facturacionElectronica: {
					habilitada: formData.facturacionElectronica.habilitada || false,
					testId: business?.facturacionElectronica.testId || "",
					responsabilidadFiscal: business?.facturacionElectronica.responsabilidadFiscal || [],
					responsableDe: business?.facturacionElectronica.responsableDe || [],
				},
			};
		},
		[countries, business],
	);

	return {
		// Data
		business,
		businessLoading,
		businessError,

		// Logo base64
		logoBase64,
		isConvertingLogo,
		clearLogoCache,

		// Form data helpers
		formData,
		getFormData,
		getUpdateDTO,

		// Mutations
		updateBusiness,
		uploadLogo,

		// Mutation states
		isUpdating: updateBusinessMutation.isPending,
		isUploadingLogo,

		// Refetch
		refetchBusiness,
	};
}

import APIClient from "@/core/api/apiClient";
import { BusinessEntity } from "../../domain/entities/BusinessEntity";
import type { CreateBusinessDTO, UpdateBusinessDTO } from "../../domain/interfaces/Business.Interfaces";
import type { BusinessDatasource } from "./BusinessDatasource";
import { urlsBusiness } from "./constants";

export class BusinessDatasourceImpl implements BusinessDatasource {
	// Helper function to transform raw API data to entity format
	private transformBusinessData(rawData: any): BusinessEntity {
		// Handle objectives structure mismatch
		// In database: objetivos are at root level
		// In TypeScript interface: objetivos are inside configuracion
		let configuracion = rawData.configuracion || {};

		// If objetivos exist at root level, move them to configuracion
		if (rawData.objetivos) {
			configuracion = {
				...configuracion,
				objetivos: rawData.objetivos,
			};
		}

		// Ensure objetivos exist with default values if not present
		if (!configuracion.objetivos) {
			configuracion.objetivos = {
				facturadoHoy: 0,
				ultimos7Dias: 0,
				ultimos30Dias: 0,
				anioActual: 0,
			};
		}

		return new BusinessEntity({
			id: rawData._id || rawData.id,
			nombre: rawData.nombre,
			nit: rawData.nit,
			contacto: rawData.contacto,
			email: rawData.email,
			direccion: rawData.direccion,
			residencia: rawData.residencia,
			telefono: rawData.telefono,
			paginaWeb: rawData.paginaWeb,
			logoUrl: rawData.logoUrl,
			configuracion: configuracion,
			ubicacion: rawData.ubicacion,
			facturacionElectronica: rawData.facturacionElectronica,
			idLocationStock: rawData.idLocationStock,
			serialMaquina: rawData.serialMaquina,
			ubicacionMaquina: rawData.ubicacionMaquina,
			tipoNegocio: rawData.tipoNegocio,
			active: rawData.active,
			createdAt: new Date(rawData.createdAt),
			updatedAt: new Date(rawData.updatedAt),
		});
	}

	async getBusinessById(id: string): Promise<BusinessEntity | null> {
		try {
			const response = await APIClient.get<any>({
				url: urlsBusiness.getBusinessById.replace(":id", id),
			});

			// Handle the new API response structure: { status: "success", data: {...} }
			const apiResponse = response?.data || response;

			if (apiResponse?.status === "success" && apiResponse.data) {
				return this.transformBusinessData(apiResponse.data);
			}

			return null;
		} catch (error: any) {
			console.error("Error fetching business by id:", error);
			if (error?.response?.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async getBusinessByNegocioId(negocioId: string): Promise<BusinessEntity | null> {
		try {
			console.log("negocioId", negocioId);
			const response = await APIClient.get<any>({
				url: urlsBusiness.getBusinessByNegocioId.replace(":negocioId", negocioId),
			});

			// Handle the new API response structure: { status: "success", data: {...} }
			// The APIClient might already extract the data, so we need to handle both cases
			const apiResponse = response?.data || response;

			console.log("apiResponse", apiResponse);

			// Check if the response has the new structure with status and data
			if (apiResponse?.status === "success" && apiResponse.data) {
				const transformedData = this.transformBusinessData(apiResponse.data);
				return transformedData;
			}

			// Check if the response is the data object directly (APIClient already extracted it)
			if (apiResponse?.id && apiResponse.nombre) {
				const transformedData = this.transformBusinessData(apiResponse);
				return transformedData;
			}

			// Check if response.data contains the business data directly
			if (response?.data?.id && response.data.nombre) {
				const transformedData = this.transformBusinessData(response.data);
				return transformedData;
			}

			return null;
		} catch (error: any) {
			console.error("Error fetching business by negocio id:", error);
			if (error?.response?.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async createBusiness(business: CreateBusinessDTO): Promise<BusinessEntity> {
		try {
			const response = await APIClient.post<any>({
				url: urlsBusiness.createBusiness,
				data: business,
			});

			// Handle the new API response structure: { status: "success", data: {...} }
			const apiResponse = response?.data || response;

			if (apiResponse?.status === "success" && apiResponse.data) {
				return this.transformBusinessData(apiResponse.data);
			}

			throw new Error("Invalid response structure from create business API");
		} catch (error: any) {
			console.error("Error creating business:", error);
			throw error;
		}
	}

	async updateBusiness(id: string, business: UpdateBusinessDTO): Promise<BusinessEntity> {
		try {
			const response = await APIClient.put<any>({
				url: urlsBusiness.updateBusiness.replace(":id", id),
				data: business,
			});

			// Handle the new API response structure: { status: "success", data: {...} }
			const apiResponse = response?.data || response;

			// Check if the response has the new structure with status and data
			if (apiResponse?.status === "success" && apiResponse.data) {
				const transformedData = this.transformBusinessData(apiResponse.data);
				return transformedData;
			}

			// Check if the response is the data object directly (APIClient already extracted it)
			if (apiResponse?.id && apiResponse.nombre) {
				const transformedData = this.transformBusinessData(apiResponse);
				return transformedData;
			}

			// Check if response.data contains the business data directly
			if (response?.data?.id && response.data.nombre) {
				const transformedData = this.transformBusinessData(response.data);
				return transformedData;
			}

			// If we get here, the response doesn't contain business data
			// This might be a case where the API only returns success status
			// In this case, we should fetch the updated business data
			// Note: Using the id as negocioId since they should be the same in this context
			const updatedBusiness = await this.getBusinessByNegocioId(id);
			if (updatedBusiness) {
				return updatedBusiness;
			}

			throw new Error("Invalid response structure from update business API");
		} catch (error: any) {
			console.error("Error updating business:", error);
			throw error;
		}
	}

	async deleteBusiness(id: string): Promise<boolean> {
		try {
			await APIClient.delete({
				url: urlsBusiness.deleteBusiness.replace(":id", id),
			});

			return true;
		} catch (error: any) {
			console.error("Error deleting business:", error);
			throw error;
		}
	}

	async uploadLogo(logoFile: File, previousLogoUrl?: string): Promise<string> {
		try {
			const formData = new FormData();
			formData.append("logo", logoFile);

			// Enviar la URL de la imagen anterior para que el backend la elimine
			if (previousLogoUrl) {
				formData.append("previousLogoUrl", previousLogoUrl);
			}

			const response = await APIClient.post<any>({
				url: urlsBusiness.uploadLogo,
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			// Handle the new API response structure: { status: "success", data: {...} }
			const apiResponse = response?.data || response;

			if (apiResponse?.status === "success" && apiResponse.data) {
				return apiResponse.data.logoUrl || "";
			}

			return "";
		} catch (error: any) {
			console.error("Error uploading logo:", error);
			throw error;
		}
	}
}

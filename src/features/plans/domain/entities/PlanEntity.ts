// src/features/plans/domain/entities/PlanEntity.ts

export interface PlanCaracteristicas {
	maxUsuarios: number;
	maxProductos: number;
	maxFacturasPorMes: number;
	maxCajasRegistradoras: number;
	soporteTecnico: boolean;
	reportesAvanzados: boolean;
	integracionContabilidad: boolean;
	backup: boolean;
}

export type PlanMoneda = "COP" | "USD";

export interface PlanEntity {
	id: string;
	nombre: string;
	descripcion: string;
	precio: number;
	moneda: PlanMoneda;
	duracionMeses: number;
	caracteristicas: PlanCaracteristicas;
	activo: boolean;
	popular?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface PlanListResponse {
	data: PlanEntity[];
	total: number;
}

// Tipos para operaciones CRUD
export interface PlanCreateRequest {
	nombre: string;
	descripcion: string;
	precio: number;
	moneda: PlanMoneda;
	duracionMeses: number;
	caracteristicas: PlanCaracteristicas;
	activo?: boolean;
	popular?: boolean;
}

export interface PlanUpdateRequest extends Partial<PlanCreateRequest> {
	id: string;
}

// Helpers para validación y cálculos (pueden usarse en servicios/use cases)
export const PlanHelpers = {
	esPlanBasico(plan: PlanEntity): boolean {
		return plan.nombre.toLowerCase().includes("básico") || plan.nombre.toLowerCase().includes("basico");
	},

	esPlanPremium(plan: PlanEntity): boolean {
		return plan.nombre.toLowerCase().includes("premium") || plan.nombre.toLowerCase().includes("profesional");
	},

	esPlanEmpresa(plan: PlanEntity): boolean {
		return plan.nombre.toLowerCase().includes("empresa") || plan.nombre.toLowerCase().includes("enterprise");
	},

	calcularPrecioTotal(plan: PlanEntity): number {
		return plan.precio * plan.duracionMeses;
	},

	calcularPrecioConDescuento(plan: PlanEntity, porcentajeDescuento: number): number {
		if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
			throw new Error("El porcentaje de descuento debe estar entre 0 y 100");
		}
		const descuento = (plan.precio * porcentajeDescuento) / 100;
		return plan.precio - descuento;
	},

	tieneCapacidadPara(plan: PlanEntity, tipo: "usuarios" | "productos" | "facturas", cantidad: number): boolean {
		switch (tipo) {
			case "usuarios":
				return cantidad <= plan.caracteristicas.maxUsuarios;
			case "productos":
				return cantidad <= plan.caracteristicas.maxProductos;
			case "facturas":
				return cantidad <= plan.caracteristicas.maxFacturasPorMes;
			default:
				return false;
		}
	},

	obtenerLimitePor(plan: PlanEntity, tipo: "usuarios" | "productos" | "facturas"): number {
		switch (tipo) {
			case "usuarios":
				return plan.caracteristicas.maxUsuarios;
			case "productos":
				return plan.caracteristicas.maxProductos;
			case "facturas":
				return plan.caracteristicas.maxFacturasPorMes;
			default:
				return 0;
		}
	},

	contarCaracteristicasActivas(plan: PlanEntity): number {
		let contador = 0;
		if (plan.caracteristicas.soporteTecnico) contador++;
		if (plan.caracteristicas.reportesAvanzados) contador++;
		if (plan.caracteristicas.integracionContabilidad) contador++;
		if (plan.caracteristicas.backup) contador++;
		return contador;
	},
};

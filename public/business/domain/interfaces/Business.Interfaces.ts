// Definimos las interfaces que representan la estructura del negocio
export interface MonedaConfig {
	simbolo: string;
	cantidadDecimales: number;
}

export interface ObjetivosConfig {
	facturadoHoy: number;
	ultimos7Dias: number;
	ultimos30Dias: number;
	anioActual: number;
}

export interface ConfiguracionNegocio {
	productosConIngredientes: boolean;
	utilizoMesas: boolean;
	envioADomicilio: boolean;
	imprimirComanda: boolean;
	costosEnvio: number[];
	moneda: MonedaConfig;
	objetivos: ObjetivosConfig;
}

export interface UbicacionNegocio {
	latitud: number;
	longitud: number;
}

export interface FacturacionElectronica {
	habilitada: boolean;
	testId?: string;
	responsabilidadFiscal: string[];
	responsableDe: string[];
}

export interface ResidenciaNegocio {
	pais: {
		codigo: string;
		nombre: string;
	};
	departamento?: {
		codigo?: string;
		nombre?: string;
	};
	ciudad?: {
		codigo?: string;
		nombre?: string;
	};
}

// Interfaz para la entidad de dominio
export interface BusinessEntityProps {
	id?: string;
	nombre: string;
	nit: string;
	contacto: string;
	email: string;
	direccion: string;
	residencia: ResidenciaNegocio;
	telefono: string;
	paginaWeb?: string;
	logoUrl?: string;
	configuracion: ConfiguracionNegocio;
	ubicacion: UbicacionNegocio;
	facturacionElectronica: FacturacionElectronica;
	idLocationStock: string;
	serialMaquina: string;
	ubicacionMaquina: string;
	tipoNegocio: string;
	createdAt?: Date;
	updatedAt?: Date;
	active: boolean;
}

export interface CreateBusinessDTO {
	nombre: string;
	nit: string;
	contacto: string;
	email: string;
	direccion: string;
	residencia: ResidenciaNegocio;
	telefono: string;
	paginaWeb?: string;
	logoUrl?: string;
	configuracion: ConfiguracionNegocio;
	ubicacion: UbicacionNegocio;
	facturacionElectronica: FacturacionElectronica;
	idLocationStock: string;
	serialMaquina: string;
	ubicacionMaquina: string;
	tipoNegocio: string;
	productosConIngredientes: boolean;
	utilizaMesas: boolean;
	envioADomicilio: boolean;
}

export interface UpdateBusinessDTO {
	nombre?: string;
	nit?: string;
	contacto?: string;
	email?: string;
	direccion?: string;
	residencia?: ResidenciaNegocio;
	telefono?: string;
	paginaWeb?: string;
	logoUrl?: string;
	configuracion?: ConfiguracionNegocio;
	ubicacion?: UbicacionNegocio;
	facturacionElectronica?: FacturacionElectronica;
	idLocationStock?: string;
	serialMaquina?: string;
	ubicacionMaquina?: string;
	tipoNegocio?: string;
	active?: boolean;
}

export interface BusinessFormData {
	nombre: string;
	nit: string;
	contacto: string;
	email: string;
	direccion: string;
	residencia: ResidenciaNegocio;
	telefono: string;
	paginaWeb: string;
	configuracion: ConfiguracionNegocio;
	facturacionElectronica: FacturacionElectronica;
	logoFile?: File;
}

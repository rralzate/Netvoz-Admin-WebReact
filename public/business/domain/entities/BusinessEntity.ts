import type {
	BusinessEntityProps,
	ConfiguracionNegocio,
	FacturacionElectronica,
	ResidenciaNegocio,
	UbicacionNegocio,
} from "../interfaces/Business.Interfaces";

// Simple email validation function since StringValidator is not available
const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

// Entidad de dominio - la clase que usará tu lógica de negocio
export class BusinessEntity {
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
	createdAt: Date;
	updatedAt: Date;
	active: boolean;

	constructor(props: BusinessEntityProps) {
		this.id = props.id;
		this.nombre = props.nombre;
		this.nit = props.nit;
		this.contacto = props.contacto;
		this.email = props.email;
		this.direccion = props.direccion;
		this.residencia = props.residencia; // Optional
		this.telefono = props.telefono;
		this.paginaWeb = props.paginaWeb;
		this.logoUrl = props.logoUrl;
		this.configuracion = props.configuracion;
		this.ubicacion = props.ubicacion;
		this.facturacionElectronica = props.facturacionElectronica;
		this.idLocationStock = props.idLocationStock;
		this.serialMaquina = props.serialMaquina;
		this.ubicacionMaquina = props.ubicacionMaquina;
		this.tipoNegocio = props.tipoNegocio;
		this.createdAt = props.createdAt || new Date();
		this.updatedAt = props.updatedAt || new Date();
		this.active = props.active;
	}

	public static create(props: BusinessEntityProps): BusinessEntity {
		// Validaciones
		BusinessEntity.validate(props);
		return new BusinessEntity(props);
	}

	private static validate(props: BusinessEntityProps): void {
		if (!props.nombre) {
			throw new Error("Missing nombre");
		}
		if (!props.nit) {
			throw new Error("Missing nit");
		}
		if (!props.contacto) {
			throw new Error("Missing contacto");
		}
		if (!props.email) {
			throw new Error("Missing email");
		}
		// Validar email con regex
		const emailRegex = validateEmail(props.email);
		if (!emailRegex) {
			throw new Error("Invalid email format");
		}
		if (!props.direccion) {
			throw new Error("Missing direccion");
		}
		if (!props.telefono) {
			throw new Error("Missing telefono");
		}
		if (!props.ubicacion || !props.ubicacion.latitud || !props.ubicacion.longitud) {
			throw new Error("Missing or invalid ubicacion");
		}
		if (!props.idLocationStock) {
			throw new Error("Missing idLocationStock");
		}
		if (!props.serialMaquina) {
			throw new Error("Missing serialMaquina");
		}
		if (!props.ubicacionMaquina) {
			throw new Error("Missing ubicacionMaquina");
		}
	}
}

/**
 * Create a default business entity
 * Domain factory function
 * @param nombre Nombre del negocio
 * @param nit NIT del negocio
 * @param contacto Nombre de contacto
 * @param email Email de contacto
 * @param pais País del negocio
 * @returns BusinessEntity con valores por defecto
 */
// Helper function to generate a unique ID (frontend-compatible)
const generateUniqueId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export function createDefaultBusiness(
	nombre: string,
	nit: string,
	contacto: string,
	email: string,
	residencia: {
		pais: {
			codigo: string;
			nombre: string;
		};
	},
	tipoNegocio: string,
): BusinessEntity {
	// Generar un ID único para el location stock
	const idLocationStock = generateUniqueId();
	// Generar una serie única para la máquina
	const serialMaquina = `SN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

	return new BusinessEntity({
		nombre: nombre,
		nit: nit,
		contacto: contacto,
		email: email,
		direccion: "Dirección pendiente por actualizar",
		residencia: {
			pais: {
				codigo: residencia.pais.codigo, // Asumiendo que el código del país es el mismo que el nombre
				nombre: residencia.pais.nombre, // Nombre del país
			},
			departamento: {
				codigo: "Departamento pendiente",
				nombre: "Departamento pendiente",
			},
			ciudad: {
				codigo: "Ciudad pendiente",
				nombre: "Ciudad pendiente",
			},
		},
		telefono: "0000000000",
		configuracion: {
			productosConIngredientes: false,
			utilizoMesas: false,
			envioADomicilio: false,
			imprimirComanda: false,
			costosEnvio: [],
			moneda: {
				simbolo: "$",
				cantidadDecimales: 2,
			},
			objetivos: {
				facturadoHoy: 0,
				ultimos7Dias: 0,
				ultimos30Dias: 0,
				anioActual: 0,
			},
		},
		ubicacion: {
			latitud: 4.60971, // Coordenadas por defecto (Bogotá)
			longitud: -74.08175,
		},
		facturacionElectronica: {
			habilitada: false,
			testId: "",
			responsabilidadFiscal: [],
			responsableDe: [],
		},
		idLocationStock: idLocationStock,
		serialMaquina: serialMaquina,
		ubicacionMaquina: "Principal",
		tipoNegocio: tipoNegocio,
		createdAt: new Date(),
		updatedAt: new Date(),
		active: true,
	});
}

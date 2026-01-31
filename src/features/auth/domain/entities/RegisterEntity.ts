export interface RegisterEntity {
	nombre: string;
	apellido: string;
	telefono: string;
	residencia: {
		pais: {
			codigo: string;
			nombre: string;
		};
	};
	nit: string;
	nombreNegocio: string;
	tipoNegocio: string;
	email: string;
	password: string;
	active?: boolean;
}

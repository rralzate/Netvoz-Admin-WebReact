import type { RegisterEntity } from "../../domain/entities/RegisterEntity";

export class RegisterModel implements RegisterEntity {
	nombre: string;
	apellido: string;
	telefono: string;
	residencia: { pais: { codigo: string; nombre: string } };
	nit: string;
	nombreNegocio: string;
	tipoNegocio: string;
	email: string;
	password: string;
	active?: boolean | undefined;

	constructor(data: RegisterEntity) {
		this.nombre = data.nombre;
		this.apellido = data.apellido;
		this.telefono = data.telefono;
		this.residencia = data.residencia;
		this.nit = data.nit;
		this.nombreNegocio = data.nombreNegocio;
		this.tipoNegocio = data.tipoNegocio;
		this.email = data.email;
		this.password = data.password;
		this.active = data.active;
	}

	toJSON() {
		return {
			nombre: this.nombre,
			apellido: this.apellido,
			telefono: this.telefono,
			residencia: this.residencia,
			nit: this.nit,
			nombreNegocio: this.nombreNegocio,
			tipoNegocio: this.tipoNegocio,
			email: this.email,
			password: this.password,
			active: this.active,
		};
	}
}

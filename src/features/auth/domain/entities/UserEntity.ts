export interface UserEntity {
	id: string;
	email: string;
	nombre: string;
	apellido: string;
	fullName: string;
	rolId: string;
	negocioId: string;
	avatar?: string;
	active?: boolean;
}

export interface Role extends CommonOptions {
	id: string;
	name: string;
	code: string;
}

export interface Permission extends CommonOptions {
	id: string;
	name: string;
	code: string; // resource:action example: "user-management:read"
}

export interface CommonOptions {
	active?: boolean;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface LoginData {
	token: string;
	refreshToken: string;
	user: UserEntity;
}

import type { LoginEntity } from "../../domain/entities/LoginEntity";

export class LoginModel implements LoginEntity {
	email: string;
	password: string;

	constructor(data: LoginEntity) {
		this.email = data.email;
		this.password = data.password;
	}

	// Convert to plain object for API calls
	toJSON() {
		return {
			email: this.email,
			password: this.password,
		};
	}
}

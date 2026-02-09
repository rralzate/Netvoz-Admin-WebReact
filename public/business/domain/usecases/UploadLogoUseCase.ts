import type { BusinessRepository } from "../repositories/BusinessRepository";

export class UploadLogoUseCase {
	constructor(private businessRepository: BusinessRepository) {}

	async execute(logoFile: File, previousLogoUrl?: string): Promise<string> {
		if (!logoFile) {
			throw new Error("Logo file is required");
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!allowedTypes.includes(logoFile.type)) {
			throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (logoFile.size > maxSize) {
			throw new Error("File size too large. Maximum size is 5MB");
		}

		return await this.businessRepository.uploadLogo(logoFile, previousLogoUrl);
	}
}

/**
 * Custom application error class with additional metadata
 */
export class AppError extends Error {
	public readonly statusCode: number;
	public readonly responseCode?: string;
	public readonly responseMessage?: string;
	public readonly field?: string;
	public readonly details?: string;
	public readonly originalError?: unknown;

	constructor(
		message: string,
		statusCodeOrOptions?:
			| number
			| {
					statusCode?: number;
					responseCode?: string;
					responseMessage?: string;
					field?: string;
					details?: string;
					originalError?: unknown;
			  },
		responseCode?: string,
		field?: string,
		details?: string,
	) {
		super(message);
		this.name = "AppError";

		// Support both positional and object-based parameters
		if (typeof statusCodeOrOptions === "number") {
			this.statusCode = statusCodeOrOptions;
			this.responseCode = responseCode;
			this.field = field;
			this.details = details;
		} else {
			const options = statusCodeOrOptions ?? {};
			this.statusCode = options.statusCode ?? 500;
			this.responseCode = options.responseCode;
			this.responseMessage = options.responseMessage;
			this.field = options.field;
			this.details = options.details;
			this.originalError = options.originalError;
		}

		// Maintain proper stack trace in V8 engines
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}

	/**
	 * Create an AppError from an unknown error
	 */
	static fromError(error: unknown, fallbackMessage = "An unexpected error occurred"): AppError {
		if (error instanceof AppError) {
			return error;
		}

		// Handle Axios errors
		if (error && typeof error === "object" && "response" in error) {
			const axiosError = error as {
				response?: {
					status?: number;
					data?: {
						message?: string;
						code?: string;
						field?: string;
						details?: string;
					};
				};
				message?: string;
			};

			const status = axiosError.response?.status ?? 500;
			const data = axiosError.response?.data;

			return new AppError(data?.message || axiosError.message || fallbackMessage, {
				statusCode: status,
				responseCode: data?.code,
				responseMessage: data?.message,
				field: data?.field,
				details: data?.details,
				originalError: error,
			});
		}

		// Handle standard Error objects
		if (error instanceof Error) {
			return new AppError(error.message || fallbackMessage, {
				originalError: error,
			});
		}

		// Handle string errors
		if (typeof error === "string") {
			return new AppError(error);
		}

		// Handle unknown errors
		return new AppError(fallbackMessage, {
			originalError: error,
		});
	}

	/**
	 * Check if error is a specific HTTP status
	 */
	isStatus(status: number): boolean {
		return this.statusCode === status;
	}

	/**
	 * Check if error is a client error (4xx)
	 */
	isClientError(): boolean {
		return this.statusCode >= 400 && this.statusCode < 500;
	}

	/**
	 * Check if error is a server error (5xx)
	 */
	isServerError(): boolean {
		return this.statusCode >= 500 && this.statusCode < 600;
	}

	/**
	 * Convert to a plain object for serialization
	 */
	toJSON(): Record<string, unknown> {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			responseCode: this.responseCode,
			responseMessage: this.responseMessage,
			field: this.field,
			details: this.details,
		};
	}
}

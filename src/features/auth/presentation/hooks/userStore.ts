import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// Import DI container and tokens
import { AppError } from "@/core/errors/AppError";
import { ResponseCodes } from "@/core/constants/ResponseCodes";
import { container } from "@/core/di/DIContainer";
import type { UserToken } from "@/core/types/entity";
import { StorageEnum } from "@/core/types/enum";
import { TOKENS } from "../../di/auth.container.config";
import type { LoginEntity } from "../../domain/entities/LoginEntity";
import type { LoginResponseEntity } from "../../domain/entities/LoginResponseEntity";
import type { RegisterEntity } from "../../domain/entities/RegisterEntity";
import type { UserEntity } from "../../domain/entities/UserEntity";
import type { LoginUseCase, LogoutUseCase, RefreshTokenUseCase } from "../../domain/usecases";
import type { RegisterUseCase } from "../../domain/usecases/RegisterUseCase";

// Global query client instance for cache management
let globalQueryClient: any = null;

export const setGlobalQueryClient = (queryClient: any) => {
	globalQueryClient = queryClient;
};

// Function to clear all React Query cache
const clearAllQueryCache = () => {
	if (globalQueryClient) {
		globalQueryClient.clear();
		globalQueryClient.removeQueries();
	}
};

type UserStore = {
	userInfo: Partial<UserEntity>;
	userToken: UserToken;

	actions: {
		setUserInfo: (userInfo: UserEntity) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
		// New Clean Architecture actions
		signInWithUseCase: (data: LoginEntity) => Promise<LoginResponseEntity>;
		signUpWithUseCase: (data: RegisterEntity) => Promise<LoginResponseEntity>;
		signOutWithUseCase: () => Promise<void>;
		refreshTokenWithUseCase: () => Promise<LoginResponseEntity>;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				clearUserInfoAndToken() {
					clearAllQueryCache();
					set({ userInfo: {}, userToken: {} });
				},

				// Clean Architecture implementation
				signInWithUseCase: async (data: LoginEntity): Promise<LoginResponseEntity> => {
					try {
						const loginUseCase = container.get<LoginUseCase>(TOKENS.LoginUseCase);
						const response = await loginUseCase.execute(data);

						// Validate response before using it
						if (!response) {
							console.error("❌ LoginUseCase returned null/undefined response");
							throw new Error("No response received from login use case");
						}

						if (!response.data) {
							console.error("❌ LoginUseCase response missing data field:", response);
							throw new Error("Invalid response: missing data field");
						}

						if (!response.data.user) {
							console.error("❌ LoginUseCase response missing user data:", response.data);
							throw new Error("Invalid response: missing user data");
						}

						// Update store with response
						get().actions.setUserToken({
							accessToken: response.data.token,
							refreshToken: response.data.refreshToken,
						});
						get().actions.setUserInfo(response.data.user);
						return response;
					} catch (error) {
						console.error("💥 Error in signInWithUseCase:", error);
						// Enhanced error logging
						if (error instanceof Error) {
							console.error("Error name:", error.name);
							console.error("Error message:", error.message);
							console.error("Error stack:", error.stack);
						} else {
							console.error("Non-Error object thrown:", typeof error, error);
						}

						// Re-throw the error without showing a toast here
						// Let the component handle the error display
						throw error;
					}
				},

				signOutWithUseCase: async (): Promise<void> => {
					try {
						const logoutUseCase = container.get<LogoutUseCase>(TOKENS.LogoutUseCase);
						const currentToken = get().userToken.accessToken;

						if (currentToken) {
							await logoutUseCase.execute();
						}

						get().actions.clearUserInfoAndToken();
					} catch (error) {
						// Clear local data even if logout fails on server
						get().actions.clearUserInfoAndToken();
						console.warn("Logout failed on server:", error);
					}
				},
				signUpWithUseCase: async (data: RegisterEntity): Promise<LoginResponseEntity> => {
					try {
						const registerUseCase = container.get<RegisterUseCase>(TOKENS.RegisterUseCase);
						const response = await registerUseCase.execute(data);
						return response;
					} catch (error) {
						console.error("💥 Error in signUpWithUseCase:", error);
						throw error;
					}
				},

				refreshTokenWithUseCase: async (): Promise<LoginResponseEntity> => {
					try {
						const refreshTokenUseCase = container.get<RefreshTokenUseCase>(TOKENS.RefreshTokenUseCase);
						const currentRefreshToken = get().userToken.refreshToken;

						if (!currentRefreshToken) {
							throw new Error("No refresh token available");
						}

						const response = await refreshTokenUseCase.execute(currentRefreshToken);

						// Update store with new tokens
						get().actions.setUserToken({
							accessToken: response.data.token,
							refreshToken: response.data.refreshToken,
						});

						// Update user info if provided
						if (response.data.user) {
							get().actions.setUserInfo(response.data.user);
						}

						return response;
					} catch (error) {
						// If refresh fails, clear user data
						get().actions.clearUserInfoAndToken();
						throw error;
					}
				},
			},
		}),
		{
			name: "userStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
			}),
		},
	),
);

// Existing selectors (preserved)
export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserActions = () => useUserStore((state) => state.actions);

// Enhanced SignIn hook with Clean Architecture
export const useSignIn = () => {
	const { setUserToken, setUserInfo, signInWithUseCase } = useUserActions();

	// Clean Architecture mutation
	const cleanArchitectureSignIn = useMutation({
		mutationFn: (data: LoginEntity) => signInWithUseCase(data),
	});

	// Primary sign in function using Clean Architecture
	const signIn = async (data: LoginEntity) => {
		const response = await cleanArchitectureSignIn.mutateAsync(data);
		if (response.data) {
			setUserToken({ accessToken: response.data.token, refreshToken: response.data.refreshToken });
			setUserInfo(response.data.user);
		}
		return response;
	};

	return {
		signIn, // Clean Architecture version (default)
		isLoading: cleanArchitectureSignIn.isPending,
		error: cleanArchitectureSignIn.error,
		isSuccess: cleanArchitectureSignIn.isSuccess,
		reset: () => {
			cleanArchitectureSignIn.reset();
		},
	};
};

export const useSignUp = () => {
	const { signUpWithUseCase, setUserToken, setUserInfo } = useUserActions();

	// Clean Architecture mutation for sign up
	const cleanArchitectureSignUp = useMutation({
		mutationFn: (data: RegisterEntity) => signUpWithUseCase(data),
		onSuccess: (response: LoginResponseEntity) => {
			// Handle successful registration
			if (response.data) {
				// Set user token if provided (some systems auto-login after registration)
				if (response.data.token && response.data.refreshToken) {
					setUserToken({
						accessToken: response.data.token,
						refreshToken: response.data.refreshToken,
					});
				}

				// Set user info if provided
				if (response.data.user) {
					setUserInfo(response.data.user);
				}

				// Show success message
				toast.success("Registration successful!", {
					position: "top-center",
				});
			}
		},
		onError: (error: any) => {
			// Handle registration error
			console.error("💥 Error in signUp:", error);

			// Convert to AppError if needed
			const appError = error instanceof AppError ? error : AppError.fromError(error, "Error al registrar el usuario");

			// Determine error message based on error type and field
			let errorMessage = appError.responseMessage || appError.message;

			// Check error message for specific patterns (in case field info is in the message)
			const errorMsgLower = errorMessage.toLowerCase();
			const originalErrorMsg = error instanceof Error ? error.message : String(error);

			// Customize message based on the field that caused the conflict
			if (appError.statusCode === 409) {
				if (
					appError.field === "email" ||
					appError.responseCode === ResponseCodes.DUPLICATE_EMAIL ||
					errorMsgLower.includes("email") ||
					errorMsgLower.includes("correo") ||
					originalErrorMsg.toLowerCase().includes("email") ||
					originalErrorMsg.toLowerCase().includes("correo")
				) {
					errorMessage = "El correo electrónico ya está registrado. Por favor, use otro correo.";
				} else if (
					appError.field === "nit" ||
					errorMsgLower.includes("nit") ||
					originalErrorMsg.toLowerCase().includes("nit")
				) {
					errorMessage = "El NIT ya está registrado. Por favor, verifique el número de identificación.";
				} else if (appError.details) {
					errorMessage = appError.details;
				} else if (originalErrorMsg && !originalErrorMsg.includes("Repository signup failed")) {
					// Use original error message if it's not the generic wrapper
					errorMessage = originalErrorMsg;
				} else {
					errorMessage = "Los datos ingresados ya existen en el sistema. Por favor, verifique la información.";
				}
			}

			// Show error toast to user
			toast.error(errorMessage, {
				position: "top-center",
				duration: 5000,
			});
		},
	});

	// Primary sign up function using Clean Architecture
	const signUp = async (data: RegisterEntity): Promise<LoginResponseEntity> => {
		const response = await cleanArchitectureSignUp.mutateAsync(data);
		if (response.data) {
			setUserToken({ accessToken: response.data.token, refreshToken: response.data.refreshToken });
			setUserInfo(response.data.user);
		}
		return response;
	};

	return {
		signUp, // Clean Architecture version (default)
		isLoading: cleanArchitectureSignUp.isPending,
		error: cleanArchitectureSignUp.error,
		isSuccess: cleanArchitectureSignUp.isSuccess,
		data: cleanArchitectureSignUp.data,
		reset: () => {
			cleanArchitectureSignUp.reset();
		},
		// Utility methods
		isAnyLoading: cleanArchitectureSignUp.isPending,
		hasError: !!cleanArchitectureSignUp.error,
		// Direct mutation access for advanced use cases
		mutateAsync: cleanArchitectureSignUp.mutateAsync,
		mutate: cleanArchitectureSignUp.mutate,
	};
};

// New hook for authentication operations with Clean Architecture
export const useAuthOperations = () => {
	const { signInWithUseCase, signOutWithUseCase, refreshTokenWithUseCase } = useUserActions();

	const login = useMutation({
		mutationFn: (data: LoginEntity) => signInWithUseCase(data),
	});

	const logout = useMutation({
		mutationFn: () => signOutWithUseCase(),
	});

	const refreshToken = useMutation({
		mutationFn: () => refreshTokenWithUseCase(),
	});

	return {
		login,
		logout,
		refreshToken,
		// Helper methods
		isAnyLoading: login.isPending || logout.isPending || refreshToken.isPending,
		hasError: !!(login.error || logout.error || refreshToken.error),
		errors: {
			login: login.error,
			logout: logout.error,
			refreshToken: refreshToken.error,
		},
	};
};

// New hook for authentication state and utilities
export const useAuthState = () => {
	const userInfo = useUserInfo();
	const userToken = useUserToken();

	const isAuthenticated = () => {
		return !!(userToken.accessToken && Object.keys(userInfo).length > 0);
	};

	// Simplified role checking using rolId
	const hasRole = (roleId: string): boolean => {
		return userInfo.rolId === roleId;
	};

	// Common role checks (you can customize these based on your system)
	const isAdmin = (): boolean => {
		// This will be determined by the usePermissions hook based on loaded role data
		return false; // Placeholder - actual logic is in usePermissions
	};
	const isModerator = (): boolean => false; // Placeholder
	const isUser = (): boolean => false; // Placeholder

	const isTokenExpiringSoon = () => {
		// You can implement token expiry check logic here
		if (!userToken.accessToken) return false;
		// Example: check if token expires in the next 5 minutes
		// This would require JWT decoding or storing expiry info
		return false;
	};

	return {
		isAuthenticated: isAuthenticated(),
		userInfo,
		userToken,
		// Simplified role checking
		hasRole,
		// Common role shortcuts
		isAdmin,
		isModerator,
		isUser,
		// Other utilities
		isTokenExpiringSoon: isTokenExpiringSoon(),
		// Computed properties
		fullName:
			userInfo.fullName ||
			(userInfo.nombre && userInfo.apellido ? `${userInfo.nombre} ${userInfo.apellido}` : userInfo.nombre || ""),
		initials:
			userInfo.nombre && userInfo.apellido
				? `${userInfo.nombre[0]}${userInfo.apellido[0]}`.toUpperCase()
				: userInfo.nombre?.[0]?.toUpperCase() || "?",
	};
};

// Hook for automatic token refresh
export const useAutoTokenRefresh = (enabled: boolean = true) => {
	const { refreshToken } = useAuthOperations();
	const { isAuthenticated, isTokenExpiringSoon } = useAuthState();

	React.useEffect(() => {
		if (!enabled || !isAuthenticated) return;

		const interval = setInterval(() => {
			if (isTokenExpiringSoon) {
				refreshToken.mutate();
			}
		}, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [enabled, isAuthenticated, isTokenExpiringSoon, refreshToken]);

	return {
		isRefreshing: refreshToken.isPending,
		refreshError: refreshToken.error,
	};
};

export default useUserStore;

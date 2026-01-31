import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

export enum LoginStateEnum {
	LOGIN = 0,
	REGISTER = 1,
	RESET_PASSWORD = 2,
	VERIFY_CODE = 3,
	NEW_PASSWORD = 4,
	MOBILE = 5,
	QR_CODE = 6,
}

interface LoginStateContextType {
	loginState: LoginStateEnum;
	setLoginState: (loginState: LoginStateEnum) => void;
	backToLogin: () => void;
	resetEmail: string;
	setResetEmail: (email: string) => void;
}
const LoginStateContext = createContext<LoginStateContextType>({
	loginState: LoginStateEnum.LOGIN,
	setLoginState: () => {},
	backToLogin: () => {},
	resetEmail: "",
	setResetEmail: () => {},
});

export function useLoginStateContext() {
	const context = useContext(LoginStateContext);
	return context;
}

export function LoginProvider({ children }: PropsWithChildren) {
	const [loginState, setLoginState] = useState(LoginStateEnum.LOGIN);
	const [resetEmail, setResetEmail] = useState("");

	function backToLogin() {
		setLoginState(LoginStateEnum.LOGIN);
		setResetEmail("");
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value: LoginStateContextType = useMemo(
		() => ({
			loginState,
			setLoginState,
			backToLogin,
			resetEmail,
			setResetEmail,
		}),
		[loginState, resetEmail],
	);

	return <LoginStateContext.Provider value={value}>{children}</LoginStateContext.Provider>;
}

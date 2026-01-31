import { Component, type ErrorInfo, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class DOMErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Check if it's a DOM manipulation error
		const isDOMError =
			error.message.includes("removeChild") ||
			error.message.includes("appendChild") ||
			error.message.includes("insertBefore") ||
			error.name === "NotFoundError";

		if (isDOMError) {
			console.warn("DOM manipulation error caught by boundary:", error);
			return { hasError: true, error };
		}

		// Let other errors bubble up
		throw error;
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("DOM Error Boundary caught an error:", error, errorInfo);

		this.setState({
			error,
			errorInfo,
		});

		// Call the onError callback if provided
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<Card className="max-w-md mx-auto mt-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-red-600">
							<Icon icon="mdi:alert-circle" size={24} />
							Error de Interfaz
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-gray-600">
							Se produjo un error temporal en la interfaz. Esto suele ocurrir cuando hay conflictos entre componentes o
							actualizaciones de la página.
						</p>

						<div className="flex gap-2">
							<Button onClick={this.handleRetry} variant="outline" size="sm">
								<Icon icon="mdi:refresh" size={16} className="mr-2" />
								Reintentar
							</Button>

							<Button onClick={this.handleReload} variant="default" size="sm">
								<Icon icon="mdi:reload" size={16} className="mr-2" />
								Recargar Página
							</Button>
						</div>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="mt-4">
								<summary className="cursor-pointer text-sm font-medium">Detalles del Error (Desarrollo)</summary>
								<pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
									{this.state.error.message}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}
					</CardContent>
				</Card>
			);
		}

		return this.props.children;
	}
}

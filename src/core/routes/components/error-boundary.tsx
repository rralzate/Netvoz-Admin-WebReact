import { Component, type ReactNode } from "react";

interface Props {
	children?: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold">Algo salió mal</h1>
						<p className="mt-4 text-gray-600">Por favor, recarga la página.</p>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

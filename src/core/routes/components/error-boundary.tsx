import type { CSSProperties } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { themeVars } from "@/core/theme/theme.css";
import { ScrollArea } from "@/core/ui/scroll-area";
import { Title } from "@/core/ui/typography";

export default function ErrorBoundary() {
	const error = useRouteError();

	return (
		<ScrollArea className="w-full h-screen">
			<div style={rootStyles()}>
				<div style={containerStyles()}>{renderErrorMessage(error)}</div>
			</div>
		</ScrollArea>
	);
}

function parseStackTrace(stack?: string) {
	if (!stack) return { filePath: null, functionName: null };

	const filePathMatch = stack.match(/\/src\/[^?]+/);
	const functionNameMatch = stack.match(/at (\S+)/);

	return {
		filePath: filePathMatch ? filePathMatch[0] : null,
		functionName: functionNameMatch ? functionNameMatch[1] : null,
	};
}

function renderErrorMessage(error: any) {
	if (isRouteErrorResponse(error)) {
		return (
			<>
				<Title as="h2">
					{error.status}: {error.statusText}
				</Title>
				<p style={messageStyles()}>{error.data}</p>
			</>
		);
	}

	if (error instanceof Error) {
		const { filePath, functionName } = parseStackTrace(error.stack);

		// Check if it's a dynamic import error
		const isDynamicImportError =
			error.message.includes("Failed to fetch dynamically imported module") ||
			error.message.includes("Loading chunk") ||
			error.message.includes("Loading CSS chunk");

		if (isDynamicImportError) {
			return (
				<>
					<Title as="h2">Module Loading Error</Title>
					<p style={messageStyles()}>
						Failed to load a page module. This usually happens when the application has been updated.
					</p>
					<div style={containerStyles()}>
						<button onClick={() => window.location.reload()} style={buttonStyles()}>
							Refresh Page
						</button>
						<button
							onClick={() => {
								// Clear cache and reload
								if ("caches" in window) {
									caches.keys().then((names) => {
										names.forEach((name) => caches.delete(name));
									});
								}
								window.location.reload();
							}}
							style={buttonStyles()}
						>
							Clear Cache & Refresh
						</button>
					</div>
					<details style={detailsStyles()}>
						<summary>Technical Details</summary>
						<p>
							{error.name}: {error.message}
						</p>
						{(filePath || functionName) && (
							<p>
								{filePath} ({functionName})
							</p>
						)}
					</details>
				</>
			);
		}

		return (
			<>
				<Title as="h2">Unexpected Application Error!</Title>
				<p style={messageStyles()}>
					{error.name}: {error.message}
				</p>
				<pre style={detailsStyles()}>{error.stack}</pre>
				{(filePath || functionName) && (
					<p style={filePathStyles()}>
						{filePath} ({functionName})
					</p>
				)}
			</>
		);
	}

	return <Title as="h2">Unknown Error</Title>;
}

const rootStyles = (): CSSProperties => {
	return {
		display: "flex",
		height: "100vh",
		flex: "1 1 auto",
		alignItems: "center",
		padding: "10vh 15px",
		flexDirection: "column",
		color: "white",
		backgroundColor: "#2c2c2e",
	};
};

const containerStyles = (): CSSProperties => {
	return {
		gap: 24,
		padding: 20,
		width: "100%",
		maxWidth: 960,
		display: "flex",
		borderRadius: 8,
		flexDirection: "column",
		backgroundColor: "#1c1c1e",
	};
};

const messageStyles = (): CSSProperties => {
	return {
		margin: 0,
		lineHeight: 1.5,
		padding: "12px 16px",
		whiteSpace: "pre-wrap",
		color: themeVars.colors.palette.error.default,
		backgroundColor: "#2a1e1e",
		borderLeft: `2px solid ${themeVars.colors.palette.error.default}`,
		fontWeight: 700,
	};
};

const detailsStyles = (): CSSProperties => {
	return {
		margin: 0,
		padding: 16,
		lineHeight: 1.5,
		overflow: "auto",
		borderRadius: "inherit",
		color: themeVars.colors.palette.warning.default,
		whiteSpace: "pre-wrap",
		backgroundColor: "#111111",
	};
};

const filePathStyles = (): CSSProperties => {
	return {
		marginTop: 16,
		color: themeVars.colors.palette.info.default,
	};
};

const buttonStyles = (): CSSProperties => {
	return {
		padding: "12px 24px",
		border: "none",
		borderRadius: 8,
		fontSize: 16,
		fontWeight: 600,
		cursor: "pointer",
		backgroundColor: themeVars.colors.palette.primary.default,
		color: "white",
		margin: "8px",
		transition: "background-color 0.2s",
	};
};

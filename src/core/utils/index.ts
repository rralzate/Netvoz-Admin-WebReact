export function urlJoin(...parts: string[]): string {
	return parts
		.map((part, index) => {
			if (index === 0) {
				return part.replace(/\/+$/, "");
			}
			return part.replace(/^\/+|\/+$/g, "");
		})
		.filter(Boolean)
		.join("/");
}

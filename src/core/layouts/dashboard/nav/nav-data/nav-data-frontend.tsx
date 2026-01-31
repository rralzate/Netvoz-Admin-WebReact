import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "PANEL DE CONTROL",
		items: [
			{
				title: "Mesa de Trabajo",
				path: "/workbench",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
			},
			{
				title: "Suscripciones",
				path: "/subscriptions",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
			},
			{
				title: "Planes",
				path: "/plans",
				icon: <Icon icon="solar:tag-price-bold-duotone" size="24" />,
			},
			{
				title: "Pagos",
				path: "/payments",
				icon: <Icon icon="solar:wallet-money-bold-duotone" size="24" />,
			},
		],
	},
];

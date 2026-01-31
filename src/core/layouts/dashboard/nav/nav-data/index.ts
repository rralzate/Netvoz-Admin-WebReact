import { GLOBAL_CONFIG } from "@/global-config";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-frontend";

const navData = GLOBAL_CONFIG.routerMode === "backend" ? backendNavData : frontendNavData;

/**
 * Hook to get navigation data
 * @returns Navigation data
 */
export const useFilteredNavData = () => {
	return navData;
};

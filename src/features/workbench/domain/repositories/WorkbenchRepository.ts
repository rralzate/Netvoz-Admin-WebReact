import type { ObjetivosConfig, WorkbenchData } from "../entities/WorkbenchEntity";

export interface WorkbenchRepository {
	getWorkbenchData(negocioId?: string, objetivos?: ObjetivosConfig): Promise<WorkbenchData>;
}

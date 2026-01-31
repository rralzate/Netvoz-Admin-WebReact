// Sistema de permisos basado en la estructura de la API
export interface PermissionSystem {
	Clientes?: ClientesPermissions;
	CuadresCaja?: CuadresCajaPermissions;
	AreasComanda?: AreasComandaPermissions;
	Usuarios?: UsuariosPermissions;
	UnidadesMedida?: UnidadesMedidaPermissions;
	TiposGastos?: TiposGastosPermissions;
	Roles?: RolesPermissions;
	Proveedores?: ProveedoresPermissions;
	ProveedoresDomicilio?: ProveedoresDomicilioPermissions;
	Promociones?: PromocionesPermissions;
	Productos?: ProductosPermissions;
	Pedidos?: PedidosPermissions;
	Inventario?: InventarioPermissions;
	Informes?: InformesPermissions;
	InformacionNegocio?: InformacionNegocioPermissions;
	Impuestos?: ImpuestosPermissions;
	Gastos?: GastosPermissions;
	Facturas?: FacturasPermissions;
	Eventos?: EventosPermissions;
	Estadisticas?: EstadisticasPermissions;
	Configuracion?: ConfiguracionPermissions;
	MediosPago?: MediosPagoPermissions;
	CajasRegistradoras?: CajasRegistradorasPermissions;
	FacturacionElectronica?: FacturacionElectronicaPermissions;
}

// Definición de cada módulo de permisos
export interface ClientesPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	realizarAbonos: boolean;
}

export interface CuadresCajaPermissions {
	crear: boolean;
	cerrar: boolean;
	listarTodos: boolean;
	arqueoCaja: boolean;
	verFacturasPagadas: boolean;
	cambiarCajero: boolean;
	verComprobanteDiario: boolean;
	verResumenInventario: boolean;
}

export interface AreasComandaPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface UsuariosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	asignarMesasClientes: boolean;
}

export interface UnidadesMedidaPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface TiposGastosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface RolesPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	verTodos: boolean;
}

export interface ProveedoresPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface ProveedoresDomicilioPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	verPendientesPorEntrega: boolean;
}

export interface PromocionesPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface ProductosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	asignarMesasProductos: boolean;
}

export interface PedidosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	listarTodos: boolean;
	cancelar: boolean;
	moverEntreMesas: boolean;
	pedidosRT: boolean;
	crearCortesias: boolean;
	resumenConsumo: boolean;
}

export interface InventarioPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	verTodos: boolean;
	moverEntreUbicaciones: boolean;
}

export interface InformesPermissions {
	porFacturas: boolean;
	porCategorias: boolean;
	porProductos: boolean;
	inventarios: boolean;
	producciones: boolean;
	traslados: boolean;
	mermas: boolean;
	gastos: boolean;
	utilidad: boolean;
}

export interface InformacionNegocioPermissions {
	create: boolean;
	edit: boolean;
	configuracionFacturaElectronica: boolean;
	activarDesactivarFacturacionElectronica: boolean;
}

export interface ImpuestosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface GastosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
	verTodos: boolean;
}

export interface FacturasPermissions {
	verTodas: boolean;
	crearFactura: boolean;
	anularFacturas: boolean;
	aplicarDescuentos: boolean;
	realizarCreditos: boolean;
	pagarCreditos: boolean;
	pagarFacturasProveedoresDomicilio: boolean;
}

export interface EventosPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface EstadisticasPermissions {
	dashboard: boolean;
	ventas: boolean;
	porMesas: boolean;
	porProductos: boolean;
	porUsuarios: boolean;
	pedidosPorHora: boolean;
	porMetodosPago: boolean;
	pedidosPorDiasSemana: boolean;
	porProveedoresDomicilio: boolean;
	promedioEntregaRepartidores: boolean;
}

export interface ConfiguracionPermissions {
	editarNegocio: boolean;
	editarDocumentos: boolean;
}

export interface MediosPagoPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface CajasRegistradorasPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export interface FacturacionElectronicaPermissions {
	configurar: boolean;
	verificarHabilitacion: boolean;
	configurarResolucion: boolean;
	mapearMetodosPago: boolean;
	mapearImpuestos: boolean;
}

// Tipos para el sistema de navegación
export interface MenuItem {
	id: string;
	title: string;
	path: string;
	icon?: string;
	module?: keyof PermissionSystem;
	children?: MenuItem[];
}

// Tipos para el guard de permisos
export interface PermissionGuardProps {
	children: React.ReactNode;
	module: keyof PermissionSystem;
	action?: string;
	actions?: string[];
	requireAll?: boolean;
	fallback?: React.ReactNode;
}

// Tipos para el botón con permisos
export interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	module: keyof PermissionSystem;
	action?: string;
	actions?: string[];
	requireAll?: boolean;
	fallback?: React.ReactNode;
	children: React.ReactNode;
}

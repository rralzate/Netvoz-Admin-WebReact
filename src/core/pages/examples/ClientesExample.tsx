import type React from "react";
import { PermissionButton, PermissionGuard } from "@/components/permissions";
import { usePermissionCheck } from "@/core/hooks/usePermissionCheck";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";

export const ClientesExample: React.FC = () => {
	const { canCreateClient, canEditClient, canDeleteClient, canRealizarAbonos } = usePermissionCheck();

	const handleCreateClient = () => {
		// TODO: Implement create client
	};

	const handleEditClient = () => {
		// TODO: Implement edit client
	};

	const handleDeleteClient = () => {
		// TODO: Implement delete client
	};

	const handleRealizarAbono = () => {
		// TODO: Implement payment
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
					<p className="text-gray-600 mt-2">Administra los clientes del sistema con control de permisos</p>
				</div>

				{/* Botón de crear con permisos */}
				<PermissionButton
					module="Clientes"
					action="create"
					className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					onClick={handleCreateClient}
				>
					+ Crear Cliente
				</PermissionButton>
			</div>

			{/* Sección de acciones con permisos */}
			<Card>
				<CardHeader>
					<CardTitle>Acciones Disponibles</CardTitle>
					<CardDescription>Las acciones mostradas dependen de los permisos de tu rol</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Crear Cliente */}
						<PermissionGuard
							module="Clientes"
							action="create"
							fallback={
								<div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
									<p>No tienes permisos para crear clientes</p>
								</div>
							}
						>
							<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
								<h3 className="font-semibold text-blue-900">Crear Cliente</h3>
								<p className="text-blue-700 text-sm mt-1">Agregar nuevos clientes al sistema</p>
								<Button className="mt-3 w-full" onClick={handleCreateClient}>
									Crear
								</Button>
							</div>
						</PermissionGuard>

						{/* Editar Cliente */}
						<PermissionGuard
							module="Clientes"
							action="edit"
							fallback={
								<div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
									<p>No tienes permisos para editar clientes</p>
								</div>
							}
						>
							<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
								<h3 className="font-semibold text-green-900">Editar Cliente</h3>
								<p className="text-green-700 text-sm mt-1">Modificar información de clientes</p>
								<Button variant="secondary" className="mt-3 w-full" onClick={handleEditClient}>
									Editar
								</Button>
							</div>
						</PermissionGuard>

						{/* Eliminar Cliente */}
						<PermissionGuard
							module="Clientes"
							action="delete"
							fallback={
								<div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
									<p>No tienes permisos para eliminar clientes</p>
								</div>
							}
						>
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<h3 className="font-semibold text-red-900">Eliminar Cliente</h3>
								<p className="text-red-700 text-sm mt-1">Eliminar clientes del sistema</p>
								<Button variant="destructive" className="mt-3 w-full" onClick={handleDeleteClient}>
									Eliminar
								</Button>
							</div>
						</PermissionGuard>

						{/* Realizar Abonos */}
						<PermissionGuard
							module="Clientes"
							action="realizarAbonos"
							fallback={
								<div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
									<p>No tienes permisos para realizar abonos</p>
								</div>
							}
						>
							<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
								<h3 className="font-semibold text-yellow-900">Realizar Abonos</h3>
								<p className="text-yellow-700 text-sm mt-1">Gestionar pagos de clientes</p>
								<Button
									variant="outline"
									className="mt-3 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
									onClick={handleRealizarAbono}
								>
									Abonar
								</Button>
							</div>
						</PermissionGuard>
					</div>
				</CardContent>
			</Card>

			{/* Información de permisos actuales */}
			<Card>
				<CardHeader>
					<CardTitle>Estado de Permisos</CardTitle>
					<CardDescription>Verificación programática de permisos para el módulo de Clientes</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-2xl mb-1">{canCreateClient() ? "✅" : "❌"}</div>
							<p className="text-sm font-medium">Crear</p>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-2xl mb-1">{canEditClient() ? "✅" : "❌"}</div>
							<p className="text-sm font-medium">Editar</p>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-2xl mb-1">{canDeleteClient() ? "✅" : "❌"}</div>
							<p className="text-sm font-medium">Eliminar</p>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-2xl mb-1">{canRealizarAbonos() ? "✅" : "❌"}</div>
							<p className="text-sm font-medium">Abonos</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Lista de clientes (ejemplo) */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Clientes</CardTitle>
					<CardDescription>Ejemplo de lista con acciones condicionales basadas en permisos</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[
							{ id: 1, name: "Juan Pérez", email: "juan@example.com" },
							{ id: 2, name: "María García", email: "maria@example.com" },
							{ id: 3, name: "Carlos López", email: "carlos@example.com" },
						].map((client) => (
							<div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
								<div>
									<h4 className="font-medium">{client.name}</h4>
									<p className="text-sm text-gray-600">{client.email}</p>
								</div>
								<div className="flex gap-2">
									<PermissionButton
										module="Clientes"
										action="edit"
										className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
										onClick={() => handleEditClient()}
									>
										Editar
									</PermissionButton>

									<PermissionButton
										module="Clientes"
										action="delete"
										className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
										onClick={() => handleDeleteClient()}
									>
										Eliminar
									</PermissionButton>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

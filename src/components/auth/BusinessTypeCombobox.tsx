import {
	Briefcase,
	Building,
	Car,
	Check,
	ChevronDown,
	Coffee,
	Heart,
	Scissors,
	Search,
	ShoppingCart,
	Store,
	Utensils,
	Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

// Tipos de negocio específicos para POS con iconos
const businessTypes = [
	{
		id: "retail",
		name: "Retail / Tienda",
		description: "Venta de productos al por menor",
		icon: Store,
		category: "Comercio",
	},
	{
		id: "restaurant",
		name: "Restaurante",
		description: "Comida y bebidas",
		icon: Utensils,
		category: "Alimentación",
	},
	{
		id: "cafe",
		name: "Cafetería",
		description: "Café, postres y snacks",
		icon: Coffee,
		category: "Alimentación",
	},
	{
		id: "grocery",
		name: "Supermercado / Tienda de abarrotes",
		description: "Productos de consumo diario",
		icon: ShoppingCart,
		category: "Comercio",
	},
	{
		id: "pharmacy",
		name: "Farmacia",
		description: "Medicamentos y productos de salud",
		icon: Heart,
		category: "Salud",
	},
	{
		id: "beauty",
		name: "Salón de belleza / Peluquería",
		description: "Servicios de belleza y cuidado personal",
		icon: Scissors,
		category: "Servicios",
	},
	{
		id: "automotive",
		name: "Automotriz",
		description: "Venta y servicio de vehículos",
		icon: Car,
		category: "Automotriz",
	},
	{
		id: "hardware",
		name: "Ferretería",
		description: "Herramientas y materiales de construcción",
		icon: Wrench,
		category: "Construcción",
	},
	{
		id: "clothing",
		name: "Ropa y Accesorios",
		description: "Vestimenta y complementos",
		icon: Store,
		category: "Moda",
	},
	{
		id: "electronics",
		name: "Electrónicos",
		description: "Dispositivos y equipos electrónicos",
		icon: Store,
		category: "Tecnología",
	},
	{
		id: "services",
		name: "Servicios Profesionales",
		description: "Consultorías y servicios especializados",
		icon: Briefcase,
		category: "Servicios",
	},
	{
		id: "hotel",
		name: "Hotel / Hospedaje",
		description: "Servicios de alojamiento",
		icon: Building,
		category: "Turismo",
	},
	{
		id: "other",
		name: "Otro",
		description: "Tipo de negocio no listado",
		icon: Store,
		category: "Otros",
	},
];

interface BusinessTypeComboboxProps {
	value?: string;
	onChange?: (businessType: { id: string; name: string; description: string; category: string }) => void;
	placeholder?: string;
	className?: string;
}

export default function BusinessTypeCombobox({
	value,
	onChange,
	placeholder = "Seleccionar tipo de negocio",
	className = "",
}: BusinessTypeComboboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedType, setSelectedType] = useState(businessTypes.find((type) => type.id === value) || null);

	const filteredTypes = businessTypes.filter(
		(type) =>
			type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			type.category.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Agrupar por categoría para mejor organización
	const groupedTypes = filteredTypes.reduce(
		(acc, type) => {
			if (!acc[type.category]) {
				acc[type.category] = [];
			}
			acc[type.category].push(type);
			return acc;
		},
		{} as Record<string, typeof businessTypes>,
	);

	useEffect(() => {
		if (value) {
			const type = businessTypes.find((t) => t.id === value);
			if (type) {
				setSelectedType(type);
			}
		}
	}, [value]);

	const handleSelect = (type: (typeof businessTypes)[0]) => {
		setSelectedType(type);
		setIsOpen(false);
		setSearchTerm("");
		onChange?.(type);
	};

	const IconComponent = selectedType?.icon || Store;

	return (
		<div className={`relative ${className}`}>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-white border border-input rounded-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<div className="flex items-center space-x-2">
					<IconComponent className="w-4 h-4 text-muted-foreground" />
					<div className="flex flex-col items-start">
						{selectedType ? (
							<>
								<span className="font-medium text-sm">{selectedType.name}</span>
								<span className="text-xs text-muted-foreground">{selectedType.category}</span>
							</>
						) : (
							<span className="text-sm text-muted-foreground">{placeholder}</span>
						)}
					</div>
				</div>
				<ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
					{/* Search Input */}
					<div className="p-2 border-b border-border">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Buscar tipo de negocio..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full h-9 pl-9 pr-3 text-sm bg-transparent border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>
					</div>

					{/* Options List */}
					<div className="max-h-80 overflow-y-auto">
						{Object.keys(groupedTypes).length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">No se encontraron tipos de negocio</div>
						) : (
							Object.entries(groupedTypes).map(([category, types]) => (
								<div key={category}>
									{/* Category Header */}
									<div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/50 border-b border-border">
										{category}
									</div>
									{/* Category Items */}
									{types.map((type) => {
										const TypeIcon = type.icon;
										return (
											<button
												key={type.id}
												type="button"
												onClick={() => handleSelect(type)}
												className="flex items-center justify-between w-full px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
											>
												<div className="flex items-center space-x-3">
													<TypeIcon className="w-4 h-4 text-muted-foreground" />
													<div className="flex flex-col items-start">
														<span className="font-medium">{type.name}</span>
														<span className="text-xs text-muted-foreground">{type.description}</span>
													</div>
												</div>
												{selectedType?.id === type.id && <Check className="w-4 h-4 text-primary" />}
											</button>
										);
									})}
								</div>
							))
						)}
					</div>
				</div>
			)}

			{/* Overlay to close dropdown */}
			{isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
		</div>
	);
}

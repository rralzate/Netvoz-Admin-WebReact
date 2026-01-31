import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";

// Lista de países con códigos telefónicos y banderas
const countries = [
	{ code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
	{ code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
	{ code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
	{ code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
	{ code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
	{ code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
	{ code: "PE", name: "Peru", dialCode: "+51", flag: "🇵🇪" },
	{ code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
	{ code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
	{ code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
	{ code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
	{ code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴" },
	{ code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
	{ code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
	{ code: "PA", name: "Panama", dialCode: "+507", flag: "🇵🇦" },
	{ code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
	{ code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
	{ code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
	{ code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
	{ code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
	{ code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
	{ code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
	{ code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
	{ code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
	{ code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
	{ code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
];

interface CountryPhoneComboboxProps {
	value?: string;
	onChange?: (country: { code: string; name: string; dialCode: string; flag: string }) => void;
	placeholder?: string;
	className?: string;
}

export default function CountryPhoneCombobox({ value, onChange, className = "" }: CountryPhoneComboboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCountry, setSelectedCountry] = useState(
		countries.find((country) => country.code === value) || countries[0],
	);

	const filteredCountries = countries.filter(
		(country) =>
			country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			country.dialCode.includes(searchTerm) ||
			country.code.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	useEffect(() => {
		if (value) {
			const country = countries.find((c) => c.code === value);
			if (country) {
				setSelectedCountry(country);
			}
		}
	}, [value]);

	const handleSelect = (country: (typeof countries)[0]) => {
		setSelectedCountry(country);
		setIsOpen(false);
		setSearchTerm("");
		onChange?.(country);
	};

	return (
		<div className={`relative ${className}`}>
			{/* Trigger Button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
			>
				<div className="flex items-center space-x-3">
					<span className="text-lg">{selectedCountry.flag}</span>
					<div className="flex flex-col items-start">
						<span className="font-medium text-gray-900">{selectedCountry.name}</span>
						<span className="text-xs text-gray-500">{selectedCountry.dialCode}</span>
					</div>
				</div>
				<ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
								placeholder="Buscar país..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full h-9 pl-9 pr-3 text-sm bg-transparent border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>
					</div>

					{/* Options List */}
					<div className="max-h-60 overflow-y-auto">
						{filteredCountries.length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">No se encontraron países</div>
						) : (
							filteredCountries.map((country) => (
								<button
									key={country.code}
									type="button"
									onClick={() => handleSelect(country)}
									className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
								>
									<div className="flex items-center space-x-3">
										<span className="text-lg">{country.flag}</span>
										<div className="flex flex-col items-start">
											<span className="font-medium">{country.name}</span>
											<span className="text-xs text-muted-foreground">{country.dialCode}</span>
										</div>
									</div>
									{selectedCountry.code === country.code && <Check className="w-4 h-4 text-primary" />}
								</button>
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

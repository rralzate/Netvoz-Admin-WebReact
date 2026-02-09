import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import useLocale from "@/core/locales/use-locale";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { useBusiness } from "../hooks/useBusiness";

type LocationFormValues = {
	latitude: number;
	longitude: number;
	address?: string;
};

interface LocationFormProps {
	onSuccess?: () => void;
}

// Google Maps types
interface GoogleMap {
	setCenter: (center: { lat: number; lng: number }) => void;
	getCenter: () => { lat: () => number; lng: () => number };
	addListener: (event: string, callback: () => void) => void;
}

interface GoogleMarker {
	position?: { lat: number; lng: number };
	setPosition: (position: { lat: number; lng: number }) => void;
	getPosition: () => { lat: () => number; lng: () => number };
	addListener: (event: string, callback: () => void) => void;
}

declare global {
	interface Window {
		google: any;
		initMap: () => void;
	}
}

export function LocationForm({ onSuccess }: LocationFormProps) {
	const { t } = useLocale();
	const { business, updateBusiness, isUpdating } = useBusiness();
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<GoogleMap | null>(null);
	const [marker, setMarker] = useState<GoogleMarker | null>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lng: number } | null>(null);
	const [isInitializing, setIsInitializing] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [autocompleteService, setAutocompleteService] = useState<any>(null);
	const [predictions, setPredictions] = useState<any[]>([]);
	const [showPredictions, setShowPredictions] = useState(false);
	const searchInputRef = useRef<HTMLDivElement>(null);

	// Validation schema with translations
	const locationFormSchema = z.object({
		latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
		longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
		address: z.string().optional(),
	});

	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationFormSchema),
		defaultValues: {
			latitude: 4.60971, // Default Bogotá coordinates
			longitude: -74.08175,
			address: "",
		},
	});

	// Load business data into form
	useEffect(() => {
		if (business?.ubicacion) {
			const { latitud, longitud } = business.ubicacion;
			form.reset({
				latitude: latitud || 4.60971,
				longitude: longitud || -74.08175,
				address: business.direccion || "",
			});
			setCurrentCoordinates({ lat: latitud || 4.60971, lng: longitud || -74.08175 });
		}
	}, [business, form]);

	// Load Google Maps script
	useEffect(() => {
		let script: HTMLScriptElement | null = null;
		let isMounted = true;

		const loadGoogleMaps = () => {
			// Check if Google Maps is already loaded and ready
			if (window.google?.maps) {
				if (isMounted) {
					initMap();
				}
				return;
			}

			// Check if script already exists but might still be loading
			const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
			if (existingScript) {
				// Wait for the existing script to load
				existingScript.addEventListener("load", () => {
					if (isMounted && window.google?.maps) {
						initMap();
					}
				});
				return;
			}

			script = document.createElement("script");
			// Use Vite environment variable syntax
			const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
			script.async = true;
			script.defer = true;
			script.onload = () => {
				if (isMounted) {
					window.initMap = initMap;
					initMap();
				}
			};
			script.onerror = () => {
				if (isMounted) {
					toast.error(t("business.location.form.messages.mapError"));
				}
			};
			document.head.appendChild(script);
		};

		loadGoogleMaps();

		// Cleanup function
		return () => {
			isMounted = false;
			// Don't remove the script as it might be used by other components
			// Just mark that this component is unmounted
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Initialize Google Map
	const initMap = () => {
		if (!mapRef.current || !window.google || !window.google.maps || isInitializing || isMapLoaded) {
			return;
		}

		setIsInitializing(true);
		const coordinates = currentCoordinates || { lat: 4.60971, lng: -74.08175 };

		try {
			// Use setTimeout to ensure DOM is ready and avoid React conflicts
			setTimeout(() => {
				if (!mapRef.current || !window.google || !window.google.maps || isMapLoaded) {
					setIsInitializing(false);
					return;
				}

				const googleMap = new window.google.maps.Map(mapRef.current, {
					zoom: 15,
					center: coordinates,
					mapTypeId: window.google.maps.MapTypeId.ROADMAP,
				});

				// Always use traditional Marker for better compatibility
				const googleMarker = new window.google.maps.Marker({
					position: coordinates,
					map: googleMap,
					draggable: true,
					title: t("business.location.form.title"),
					animation: window.google.maps.Animation.DROP,
				});

				// Update form when marker is dragged
				googleMarker.addListener("dragend", () => {
					const position = googleMarker.getPosition();
					if (position) {
						const lat = position.lat();
						const lng = position.lng();
						form.setValue("latitude", lat);
						form.setValue("longitude", lng);
					}
				});

				// Update marker when map is clicked
				googleMap.addListener("click", (event: any) => {
					if (event.latLng) {
						const lat = event.latLng.lat();
						const lng = event.latLng.lng();

						// Update marker position
						googleMarker.setPosition({ lat, lng });

						// Update form values
						form.setValue("latitude", lat);
						form.setValue("longitude", lng);
					}
				});

				// Initialize Places services
				const autocomplete = new window.google.maps.places.AutocompleteService();

				setAutocompleteService(autocomplete);
				setMap(googleMap);
				setMarker(googleMarker);
				setIsMapLoaded(true);
				setIsInitializing(false);
			}, 100);
		} catch (error) {
			console.error("Error initializing Google Map:", error);
			toast.error(t("business.location.form.messages.mapError"));
			setIsInitializing(false);
		}
	};

	// Update map when form coordinates change
	const watchedLatitude = form.watch("latitude");
	const watchedLongitude = form.watch("longitude");
	useEffect(() => {
		if (map && marker && isMapLoaded) {
			if (watchedLatitude && watchedLongitude) {
				const newPosition = { lat: watchedLatitude, lng: watchedLongitude };
				map.setCenter(newPosition);
				marker.setPosition(newPosition);
			}
		}
	}, [watchedLatitude, watchedLongitude, map, marker, isMapLoaded]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Clear map and marker references
			setMap(null);
			setMarker(null);
			setIsMapLoaded(false);
			setIsInitializing(false);
			setAutocompleteService(null);
		};
	}, []);

	const onSubmit = async (data: LocationFormValues) => {
		if (!business?.id) {
			toast.error("Business information not found");
			return;
		}

		try {
			// Update the business location
			const businessData = {
				ubicacion: {
					latitud: data.latitude,
					longitud: data.longitude,
				},
				direccion: data.address,
			};

			await updateBusiness(business.id, businessData);
			toast.success(t("business.location.form.messages.success"));
			onSuccess?.();
		} catch (error) {
			console.error("Error saving location:", error);
			toast.error(t("business.location.form.messages.error"));
		}
	};

	const resetToCurrent = () => {
		if (currentCoordinates) {
			// Reset coordinates
			form.setValue("latitude", currentCoordinates.lat);
			form.setValue("longitude", currentCoordinates.lng);

			// Reset address to original business address
			if (business?.direccion) {
				form.setValue("address", business.direccion);
			}

			// Update map and marker if they exist
			if (map && marker) {
				map.setCenter(currentCoordinates);
				marker.setPosition(currentCoordinates);
			}

			toast.success("Ubicación restablecida a los valores originales");
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim() || !map || !marker) {
			return;
		}

		try {
			// Use Geocoding service to search for the address
			const geocoder = new window.google.maps.Geocoder();

			geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
				if (status === "OK" && results && results[0]) {
					const location = results[0].geometry.location;
					const lat = location.lat();
					const lng = location.lng();

					// Update map center and marker position
					map.setCenter({ lat, lng });
					marker.setPosition({ lat, lng });

					// Update form values
					form.setValue("latitude", lat);
					form.setValue("longitude", lng);
					form.setValue("address", results[0].formatted_address);

					// Clear search query
					setSearchQuery("");

					toast.success(t("business.location.form.messages.success"));
				} else {
					toast.error(t("business.location.form.search.noResults"));
				}
			});
		} catch (error) {
			console.error("Error searching address:", error);
			toast.error(t("business.location.form.messages.error"));
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSearch();
		}
	};

	// Get autocomplete predictions when typing
	const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);

		if (!value.trim()) {
			setPredictions([]);
			setShowPredictions(false);
			return;
		}

		if (!autocompleteService) {
			return;
		}

		// Get predictions from Google Places Autocomplete
		autocompleteService.getPlacePredictions(
			{
				input: value,
				componentRestrictions: { country: "co" }, // Restrict to Colombia
			},
			(predictions: any, status: any) => {
				if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
					setPredictions(predictions);
					setShowPredictions(true);
				} else {
					setPredictions([]);
					setShowPredictions(false);
				}
			},
		);
	};

	// Handle selection of a prediction from the dropdown
	const handlePredictionSelect = (placeId: string, description: string) => {
		if (!map || !marker) return;

		const placesService = new window.google.maps.places.PlacesService(map);

		placesService.getDetails(
			{
				placeId: placeId,
				fields: ["geometry", "formatted_address"],
			},
			(place: any, status: any) => {
				if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
					const location = place.geometry.location;
					const lat = location.lat();
					const lng = location.lng();

					// Update map and marker
					map.setCenter({ lat, lng });
					marker.setPosition({ lat, lng });

					// Update form values
					form.setValue("latitude", lat);
					form.setValue("longitude", lng);
					form.setValue("address", place.formatted_address || description);

					// Clear search and hide predictions
					setSearchQuery("");
					setPredictions([]);
					setShowPredictions(false);

					toast.success("Ubicación actualizada");
				} else {
					toast.error("No se pudo obtener los detalles del lugar");
				}
			},
		);
	};

	// Close predictions when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
				setShowPredictions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">{t("business.location.form.title")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Address Field */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="address" className="text-sm font-medium text-gray-700">
								{t("business.location.form.fields.address")}
							</Label>
							<Button type="button" variant="outline" size="sm" onClick={resetToCurrent} disabled={!currentCoordinates}>
								{t("business.location.form.actions.reset")}
							</Button>
						</div>
						<Input
							id="address"
							type="text"
							placeholder={t("business.location.form.placeholders.address")}
							{...form.register("address")}
							className="w-full"
						/>
					</div>

					{/* Address Search with Autocomplete */}
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">{t("business.location.form.actions.search")}</Label>
						<div className="relative" ref={searchInputRef}>
							<div className="flex gap-2">
								<Input
									type="text"
									value={searchQuery}
									onChange={handleSearchInputChange}
									onKeyPress={handleKeyPress}
									placeholder={t("business.location.form.search.placeholder")}
									className="flex-1"
									disabled={!isMapLoaded}
									onFocus={() => predictions.length > 0 && setShowPredictions(true)}
								/>
								<Button
									type="button"
									onClick={handleSearch}
									disabled={!searchQuery.trim() || !isMapLoaded}
									variant="outline"
								>
									{t("business.location.form.actions.search")}
								</Button>
							</div>

							{/* Autocomplete Predictions Dropdown */}
							{showPredictions && predictions.length > 0 && (
								<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
									{predictions.map((prediction: any) => (
										<button
											type="button"
											key={prediction.place_id}
											className="w-full text-left px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
											onClick={() => handlePredictionSelect(prediction.place_id, prediction.description)}
										>
											<p className="text-sm font-medium text-gray-900">{prediction.structured_formatting?.main_text}</p>
											<p className="text-xs text-gray-500">{prediction.structured_formatting?.secondary_text}</p>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Google Map */}
					<div className="space-y-2">
						<Label className="text-sm font-medium text-gray-700">
							{t("business.location.form.actions.viewChange")}
						</Label>
						<div
							className="relative w-full h-96 rounded-lg border border-gray-200 bg-gray-100"
							style={{ minHeight: "400px" }}
						>
							{/* Map container - always rendered */}
							<div ref={mapRef} className="w-full h-full rounded-lg" />
							{/* Loading overlay */}
							{!isMapLoaded && (
								<div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
										<p className="text-gray-500">{t("business.location.form.messages.loading")}</p>
									</div>
								</div>
							)}
						</div>
						<p className="text-xs text-gray-500">Click on the map or drag the marker to update the location</p>
					</div>

					{/* Coordinates Input Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Latitude */}
						<div className="space-y-2">
							<Label htmlFor="latitude" className="text-sm font-medium text-gray-700">
								{t("business.location.form.fields.latitude")}
							</Label>
							<Input
								id="latitude"
								type="number"
								step="any"
								placeholder={t("business.location.form.placeholders.latitude")}
								{...form.register("latitude", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.latitude && (
								<p className="text-sm text-red-600">{form.formState.errors.latitude.message}</p>
							)}
						</div>

						{/* Longitude */}
						<div className="space-y-2">
							<Label htmlFor="longitude" className="text-sm font-medium text-gray-700">
								{t("business.location.form.fields.longitude")}
							</Label>
							<Input
								id="longitude"
								type="number"
								step="any"
								placeholder={t("business.location.form.placeholders.longitude")}
								{...form.register("longitude", { valueAsNumber: true })}
								className="w-full"
							/>
							{form.formState.errors.longitude && (
								<p className="text-sm text-red-600">{form.formState.errors.longitude.message}</p>
							)}
						</div>
					</div>

					{/* Address Field */}
					<div className="space-y-2">
						<Label htmlFor="address" className="text-sm font-medium text-gray-700">
							{t("business.location.form.fields.address")}
						</Label>
						<Input
							id="address"
							type="text"
							placeholder={t("business.location.form.placeholders.address")}
							{...form.register("address")}
							className="w-full"
						/>
					</div>

					{/* Save Button */}
					<div className="flex justify-center pt-6">
						<Button type="submit" disabled={isUpdating} className="min-w-[200px] text-white">
							{isUpdating ? t("business.location.form.messages.saving") : t("business.location.form.messages.save")}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

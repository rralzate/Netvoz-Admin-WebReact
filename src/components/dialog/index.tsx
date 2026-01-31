import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";

interface ConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	itemName?: string;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	variant?: "danger" | "warning" | "info";
}

export function ConfirmationDialog({
	open,
	onClose,
	onConfirm,
	title,
	message,
	itemName,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	isLoading = false,
	variant = "danger",
}: ConfirmationDialogProps) {
	const getVariantConfig = () => {
		switch (variant) {
			case "danger":
				return {
					icon: "mdi:alert-circle",
					iconColor: "text-red-500",
					bgColor: "bg-red-50",
					borderColor: "border-red-200",
					buttonClass: "bg-red-600 hover:bg-red-700 text-white",
				};
			case "warning":
				return {
					icon: "mdi:alert",
					iconColor: "text-yellow-500",
					bgColor: "bg-yellow-50",
					borderColor: "border-yellow-200",
					buttonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
				};
			case "info":
				return {
					icon: "mdi:information",
					iconColor: "text-blue-500",
					bgColor: "bg-blue-50",
					borderColor: "border-blue-200",
					buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
				};
		}
	};

	const config = getVariantConfig();

	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3">
						<div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
							<Icon icon={config.icon} size={24} className={config.iconColor} />
						</div>
						<span>{title}</span>
					</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					<p className="text-gray-600 mb-3">{message}</p>

					{itemName && (
						<div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
							<div className="flex items-center gap-2">
								<Icon icon="mdi:tag" size={16} className={config.iconColor} />
								<span className="font-medium text-gray-800">{itemName}</span>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<div className="flex gap-3 w-full justify-end">
						<Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
							{cancelText}
						</Button>
						<Button type="button" className={config.buttonClass} onClick={handleConfirm} disabled={isLoading}>
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									<span>Procesando...</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Icon icon="mdi:check" size={16} />
									<span>{confirmText}</span>
								</div>
							)}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

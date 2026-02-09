import { useState } from "react";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { Icon } from "@/components/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Textarea } from "@/core/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/core/ui/select";
import type { SubscriptionEntity } from "../../domain/entities/SubscriptionEntity";
import logoImage from "@/assets/icons/ic-logo-badge.png";

interface ModalGenerateInvoiceProps {
	isOpen: boolean;
	onClose: () => void;
	subscription: SubscriptionEntity;
}

type MetodoPago = "efectivo" | "transferencia" | "tarjeta_credito" | "tarjeta_debito" | "pse";

const metodoPagoLabels: Record<MetodoPago, string> = {
	efectivo: "Efectivo",
	transferencia: "Transferencia Bancaria",
	tarjeta_credito: "Tarjeta de Crédito",
	tarjeta_debito: "Tarjeta de Débito",
	pse: "PSE",
};

function formatCurrency(value: number, moneda: "COP" | "USD" = "COP"): string {
	return new Intl.NumberFormat(moneda === "COP" ? "es-CO" : "en-US", {
		style: "currency",
		currency: moneda,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("es-CO", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function generateInvoiceNumber(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
	return `FAC-${year}${month}-${random}`;
}

export function ModalGenerateInvoice({
	isOpen,
	onClose,
	subscription,
}: ModalGenerateInvoiceProps) {
	const { t } = useTranslation();
	const [isGenerating, setIsGenerating] = useState(false);
	const [showPreview, setShowPreview] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		monto: subscription.valorMensual || 0,
		metodoPago: "transferencia" as MetodoPago,
		fechaPago: new Date().toISOString().split("T")[0],
		referencia: "",
		notas: "",
	});

	const [invoiceNumber] = useState(generateInvoiceNumber());

	const handleInputChange = (field: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleGeneratePreview = () => {
		setShowPreview(true);
	};

	const handleDownloadPDF = async () => {
		setIsGenerating(true);

		try {
			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			let y = 20;

			// Add logo in top right corner
			try {
				// Load and convert image to base64
				const response = await fetch(logoImage);
				const blob = await response.blob();
				const reader = new FileReader();
				
				await new Promise((resolve) => {
					reader.onloadend = () => {
						const base64data = reader.result as string;
						// Add logo: x, y, width, height (positioned in top right)
						pdf.addImage(base64data, "PNG", pageWidth - 40, 10, 25, 25);
						resolve(true);
					};
					reader.readAsDataURL(blob);
				});
			} catch (logoError) {
				console.warn("Could not add logo to PDF:", logoError);
			}

			// Header
			pdf.setFontSize(24);
			pdf.setFont("helvetica", "bold");
			pdf.text("FACTURA DE PAGO", 20, y);

			pdf.setFontSize(10);
			pdf.setFont("helvetica", "normal");
			pdf.text("Comprobante de Suscripción", 20, y + 8);

			y += 15;

			// Invoice number and date (below "Comprobante de Suscripción", left side)
			pdf.setFontSize(11);
			pdf.setFont("helvetica", "bold");
			pdf.text(invoiceNumber, 20, y);
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(10);
			pdf.text(`Fecha: ${formatDate(new Date(formData.fechaPago))}`, 20, y + 6);

			y += 15;

			// Line separator
			pdf.setDrawColor(200, 200, 200);
			pdf.line(20, y, pageWidth - 20, y);
			y += 10;

			// Company info
			pdf.setFontSize(12);
			pdf.setFont("helvetica", "bold");
			pdf.text("NETVOZ", 20, y);
			pdf.setFont("helvetica", "normal");
			pdf.setFontSize(10);
			pdf.text("Sistema de Gestión de Suscripciones", 20, y + 6);
			pdf.text("netvozapp@gmail.com", 20, y + 12);

			y += 25;

			// Client info
			pdf.setFontSize(10);
			pdf.setFont("helvetica", "bold");
			pdf.setTextColor(100, 100, 100);
			pdf.text("FACTURADO A:", 20, y);
			pdf.setTextColor(0, 0, 0);
			pdf.setFontSize(12);
			pdf.text(subscription.nombreNegocio || "Sin nombre", 20, y + 7);
			pdf.setFontSize(10);
			pdf.setFont("helvetica", "normal");
			pdf.text(`ID Negocio: ${subscription.negocioId}`, 20, y + 14);

			y += 30;

			// Table header
			pdf.setFillColor(245, 245, 245);
			pdf.rect(20, y, pageWidth - 40, 10, "F");
			pdf.setFontSize(10);
			pdf.setFont("helvetica", "bold");
			pdf.text("Descripción", 25, y + 7);
			pdf.text("Cant.", 120, y + 7);
			pdf.text("Precio", 140, y + 7);
			pdf.text("Total", pageWidth - 25, y + 7, { align: "right" });

			y += 15;

			// Table content
			pdf.setFont("helvetica", "normal");
			pdf.text(`Suscripción - ${subscription.nombrePlan || "Plan"}`, 25, y);
			pdf.setFontSize(9);
			pdf.setTextColor(100, 100, 100);
			pdf.text("Período mensual", 25, y + 5);
			pdf.setTextColor(0, 0, 0);
			pdf.setFontSize(10);
			pdf.text("1", 125, y);
			pdf.text(formatCurrency(formData.monto, subscription.moneda || "COP"), 140, y);
			pdf.text(formatCurrency(formData.monto, subscription.moneda || "COP"), pageWidth - 25, y, { align: "right" });

			y += 20;

			// Line
			pdf.setDrawColor(230, 230, 230);
			pdf.line(20, y, pageWidth - 20, y);
			y += 10;

			// Totals
			pdf.setFontSize(10);
			pdf.text("Subtotal:", 130, y);
			pdf.text(formatCurrency(formData.monto, subscription.moneda || "COP"), pageWidth - 25, y, { align: "right" });
			y += 10;

			pdf.setFontSize(14);
			pdf.setFont("helvetica", "bold");
			pdf.text("TOTAL:", 130, y);
			pdf.text(formatCurrency(formData.monto, subscription.moneda || "COP"), pageWidth - 25, y, { align: "right" });

			y += 20;

			// Payment info box
			pdf.setFillColor(249, 250, 251);
			pdf.rect(20, y, pageWidth - 40, 35, "F");
			y += 8;

			pdf.setFontSize(10);
			pdf.setFont("helvetica", "bold");
			pdf.setTextColor(100, 100, 100);
			pdf.text("INFORMACIÓN DEL PAGO", 25, y);
			pdf.setTextColor(0, 0, 0);
			y += 8;

			pdf.setFont("helvetica", "normal");
			pdf.text(`Método de Pago: ${metodoPagoLabels[formData.metodoPago]}`, 25, y);
			pdf.text("Estado: Pagado", 120, y);
			y += 6;

			if (formData.referencia) {
				pdf.text(`Referencia: ${formData.referencia}`, 25, y);
			}

			y += 20;

			// Notes
			if (formData.notas) {
				pdf.setFontSize(10);
				pdf.setFont("helvetica", "bold");
				pdf.setTextColor(100, 100, 100);
				pdf.text("NOTAS:", 20, y);
				pdf.setTextColor(0, 0, 0);
				pdf.setFont("helvetica", "normal");
				pdf.text(formData.notas, 20, y + 7);
				y += 20;
			}

			// Footer
			y = pdf.internal.pageSize.getHeight() - 30;
			pdf.setDrawColor(200, 200, 200);
			pdf.line(20, y, pageWidth - 20, y);
			y += 8;

			pdf.setFontSize(9);
			pdf.setTextColor(128, 128, 128);
			pdf.text("Gracias por su pago", pageWidth / 2, y, { align: "center" });
			pdf.text("Este documento es un comprobante de pago válido", pageWidth / 2, y + 5, { align: "center" });

			// Save
			pdf.save(`${invoiceNumber}.pdf`);
			onClose();
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleClose = () => {
		setShowPreview(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="lucide:file-text" className="h-5 w-5 text-primary" />
						{t("subscriptions.invoice.title", "Generar Factura de Pago")}
					</DialogTitle>
					<DialogDescription>
						{t(
							"subscriptions.invoice.description",
							"Registra el pago y genera una factura para {business}"
						).replace("{business}", subscription.nombreNegocio || "este negocio")}
					</DialogDescription>
				</DialogHeader>

				{!showPreview ? (
					// Form to enter payment details
					<div className="space-y-6 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="monto">Monto del Pago *</Label>
								<Input
									id="monto"
									type="number"
									value={formData.monto}
									onChange={(e) => handleInputChange("monto", parseFloat(e.target.value) || 0)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fechaPago">Fecha de Pago *</Label>
								<Input
									id="fechaPago"
									type="date"
									value={formData.fechaPago}
									onChange={(e) => handleInputChange("fechaPago", e.target.value)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="metodoPago">Método de Pago *</Label>
								<Select
									value={formData.metodoPago}
									onValueChange={(value: MetodoPago) => handleInputChange("metodoPago", value)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(metodoPagoLabels).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="referencia">Número de Referencia</Label>
								<Input
									id="referencia"
									value={formData.referencia}
									onChange={(e) => handleInputChange("referencia", e.target.value)}
									placeholder="Ej: TRX-123456"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notas">Notas Adicionales</Label>
							<Textarea
								id="notas"
								value={formData.notas}
								onChange={(e) => handleInputChange("notas", e.target.value)}
								placeholder="Observaciones del pago..."
								rows={2}
							/>
						</div>

						{/* Summary */}
						<div className="bg-muted/50 rounded-lg p-4">
							<h4 className="font-medium mb-3">Resumen del Pago</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Negocio:</span>
									<span className="font-medium">{subscription.nombreNegocio}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Plan:</span>
									<span className="font-medium">{subscription.nombrePlan}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Monto:</span>
									<span className="font-medium text-primary">
										{formatCurrency(formData.monto, subscription.moneda || "COP")}
									</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					// Invoice Preview
					<div className="py-4">
						<div
							className="bg-white p-8 border rounded-lg relative"
							style={{ minHeight: "600px" }}
						>
							{/* Logo in top right corner */}
							<img
								src={logoImage}
								alt="Netvoz"
								className="absolute top-4 right-4 w-16 h-16 object-contain"
							/>

							{/* Invoice Header */}
							<div className="mb-8">
								<h1 className="text-2xl font-bold text-gray-800">FACTURA DE PAGO</h1>
								<p className="text-gray-600 mt-1">Comprobante de Suscripción</p>
								<div className="mt-3">
									<p className="text-base font-bold text-primary">{invoiceNumber}</p>
									<p className="text-sm text-gray-600">
										Fecha: {formatDate(new Date(formData.fechaPago))}
									</p>
								</div>
							</div>

							{/* Company Info */}
							<div className="mb-8 pb-4 border-b">
								<h2 className="font-semibold text-gray-800">NETVOZ</h2>
								<p className="text-sm text-gray-600">Sistema de Gestión de Suscripciones</p>
								<p className="text-sm text-gray-600">netvozapp@gmail.com</p>
							</div>

							{/* Client Info */}
							<div className="mb-8">
								<h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Facturado a:</h3>
								<p className="font-semibold text-gray-800">{subscription.nombreNegocio}</p>
								<p className="text-sm text-gray-600">ID Negocio: {subscription.negocioId}</p>
							</div>

							{/* Invoice Details */}
							<table className="w-full mb-8">
								<thead>
									<tr className="border-b-2 border-gray-200">
										<th className="text-left py-3 text-sm font-semibold text-gray-600">Descripción</th>
										<th className="text-right py-3 text-sm font-semibold text-gray-600">Cantidad</th>
										<th className="text-right py-3 text-sm font-semibold text-gray-600">Precio</th>
										<th className="text-right py-3 text-sm font-semibold text-gray-600">Total</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-b border-gray-100">
										<td className="py-4">
											<p className="font-medium text-gray-800">
												Suscripción - {subscription.nombrePlan}
											</p>
											<p className="text-sm text-gray-500">Período mensual</p>
										</td>
										<td className="text-right py-4 text-gray-600">1</td>
										<td className="text-right py-4 text-gray-600">
											{formatCurrency(formData.monto, subscription.moneda || "COP")}
										</td>
										<td className="text-right py-4 font-medium text-gray-800">
											{formatCurrency(formData.monto, subscription.moneda || "COP")}
										</td>
									</tr>
								</tbody>
							</table>

							{/* Total */}
							<div className="flex justify-end mb-8">
								<div className="w-64">
									<div className="flex justify-between py-2 border-b">
										<span className="text-gray-600">Subtotal:</span>
										<span className="font-medium">
											{formatCurrency(formData.monto, subscription.moneda || "COP")}
										</span>
									</div>
									<div className="flex justify-between py-3 text-lg">
										<span className="font-semibold">Total:</span>
										<span className="font-bold text-primary">
											{formatCurrency(formData.monto, subscription.moneda || "COP")}
										</span>
									</div>
								</div>
							</div>

							{/* Payment Info */}
							<div className="bg-gray-50 rounded-lg p-4 mb-6">
								<h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
									Información del Pago
								</h3>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-gray-500">Método de Pago:</span>
										<p className="font-medium">{metodoPagoLabels[formData.metodoPago]}</p>
									</div>
									<div>
										<span className="text-gray-500">Estado:</span>
										<p className="font-medium text-green-600">Pagado</p>
									</div>
									{formData.referencia && (
										<div>
											<span className="text-gray-500">Referencia:</span>
											<p className="font-medium">{formData.referencia}</p>
										</div>
									)}
								</div>
							</div>

							{/* Notes */}
							{formData.notas && (
								<div className="mb-6">
									<h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notas:</h3>
									<p className="text-sm text-gray-600">{formData.notas}</p>
								</div>
							)}

							{/* Footer */}
							<div className="text-center text-sm text-gray-500 pt-4 border-t">
								<p>Gracias por su pago</p>
								<p className="mt-1">Este documento es un comprobante de pago válido</p>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					{!showPreview ? (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancelar
							</Button>
							<Button onClick={handleGeneratePreview} disabled={formData.monto <= 0}>
								<Icon icon="lucide:eye" className="mr-2 h-4 w-4" />
								Vista Previa
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" onClick={() => setShowPreview(false)}>
								<Icon icon="lucide:arrow-left" className="mr-2 h-4 w-4" />
								Editar
							</Button>
							<Button onClick={handleDownloadPDF} disabled={isGenerating}>
								{isGenerating ? (
									<>
										<Icon icon="lucide:loader-2" className="mr-2 h-4 w-4 animate-spin" />
										Generando...
									</>
								) : (
									<>
										<Icon icon="lucide:download" className="mr-2 h-4 w-4" />
										Descargar PDF
									</>
								)}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ModalGenerateInvoice;

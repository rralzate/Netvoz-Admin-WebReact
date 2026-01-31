import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/core/utils";
import { VisuallyHidden } from "./visually-hidden";

function WideDialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="wide-dialog" {...props} />;
}

function WideDialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="wide-dialog-trigger" {...props} />;
}

function WideDialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="wide-dialog-portal" {...props} />;
}

function WideDialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="wide-dialog-close" {...props} />;
}

function WideDialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="wide-dialog-overlay"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
				className,
			)}
			{...props}
		/>
	);
}

function WideDialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<WideDialogPortal data-slot="wide-dialog-portal">
			<WideDialogOverlay />
			<DialogPrimitive.Content
				data-slot="wide-dialog-content"
				className={cn(
					"text-text-primary bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200",
					// Clases específicas para el diálogo ancho
					"sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl",
					"max-h-[90vh] overflow-hidden",
					className,
				)}
				aria-describedby={undefined}
				{...props}
			>
				{/* Default title for accessibility - hidden visually but available to screen readers */}
				<VisuallyHidden>
					<DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
				</VisuallyHidden>
				{children}
				<DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 z-10">
					<XIcon />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</WideDialogPortal>
	);
}

function WideDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="wide-dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function WideDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="wide-dialog-footer"
			className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
			{...props}
		/>
	);
}

function WideDialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="wide-dialog-title"
			className={cn("text-lg leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function WideDialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="wide-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	WideDialog,
	WideDialogClose,
	WideDialogContent,
	WideDialogDescription,
	WideDialogFooter,
	WideDialogHeader,
	WideDialogOverlay,
	WideDialogPortal,
	WideDialogTitle,
	WideDialogTrigger,
};

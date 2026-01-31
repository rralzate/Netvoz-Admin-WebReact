import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/icon";
import { Avatar, AvatarImage } from "@/core/ui/avatar";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { Text, Title } from "@/core/ui/typography";
import { useUserInfo } from "@/features/auth/presentation/hooks/userStore";

function UserProfile() {
	const { t } = useTranslation();
	const { avatar, nombre, email, apellido } = useUserInfo();

	const [profileData, setProfileData] = useState({
		nombre: nombre || "",
		apellido: apellido || "",
		email: email || "",
		telefono: "", // TODO: Add telefono to UserEntity if needed
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleProfileChange = (field: string, value: string) => {
		setProfileData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveProfile = () => {
		// TODO: Implement save profile logic
	};

	const handleSavePassword = () => {
		// TODO: Implement save password logic
	};

	return (
		<div className="container mx-auto p-6 max-w-4xl">
			<Tabs defaultValue="profile" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<Icon icon="mdi:account" className="h-4 w-4" />
						{t("sys.nav.user.profile")}
					</TabsTrigger>
					<TabsTrigger value="password" className="flex items-center gap-2">
						<Icon icon="mdi:lock" className="h-4 w-4" />
						{t("sys.nav.user.password", "Contraseña")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Icon icon="mdi:account" className="h-5 w-5" />
								{t("sys.nav.user.profile")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Avatar Section */}
							<div className="flex flex-col items-center space-y-4">
								<div className="relative">
									{avatar ? (
										<Avatar className="h-32 w-32">
											<AvatarImage src={avatar} alt={nombre} className="rounded-full" />
										</Avatar>
									) : (
										<div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
											<Icon icon="mdi:account-circle" className="h-20 w-20 text-gray-400" />
										</div>
									)}
								</div>
								<div className="text-center">
									<Title as="h3" className="text-lg font-semibold">
										{nombre || "Usuario"}
									</Title>
									<Text variant="body2" className="text-muted-foreground">
										{t("sys.nav.user.role", "Administrador")}
									</Text>
								</div>
							</div>

							{/* Profile Form */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="nombre">{t("sys.nav.user.name", "Nombre")} *</Label>
									<Input
										id="nombre"
										value={profileData.nombre}
										onChange={(e) => handleProfileChange("nombre", e.target.value)}
										placeholder={t("sys.nav.user.namePlaceholder", "Ingrese su nombre")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="apellido">{t("sys.nav.user.lastname", "Apellido")} *</Label>
									<Input
										id="apellido"
										value={profileData.apellido}
										onChange={(e) => handleProfileChange("apellido", e.target.value)}
										placeholder={t("sys.nav.user.lastnamePlaceholder", "Ingrese su apellido")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">{t("sys.nav.user.email", "Email")} *</Label>
									<Input
										id="email"
										type="email"
										value={profileData.email}
										onChange={(e) => handleProfileChange("email", e.target.value)}
										placeholder={t("sys.nav.user.emailPlaceholder", "Ingrese su email")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="telefono">{t("sys.nav.user.phone", "Teléfono")}</Label>
									<Input
										id="telefono"
										value={profileData.telefono}
										onChange={(e) => handleProfileChange("telefono", e.target.value)}
										placeholder={t("sys.nav.user.phonePlaceholder", "Ingrese su teléfono")}
									/>
								</div>
								<div className="space-y-2">
									<Label>{t("sys.nav.user.changeImage", "Cambiar imagen")}</Label>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm">
											<Icon icon="mdi:file-upload" className="h-4 w-4 mr-2" />
											{t("sys.nav.user.chooseFile", "Elegir archivo")}
										</Button>
										<Text variant="caption" className="text-muted-foreground">
											{t("sys.nav.user.noFileSelected", "ningún archivo seleccionado")}
										</Text>
									</div>
								</div>
							</div>

							<div className="flex justify-center pt-4">
								<Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 text-white">
									<Icon icon="mdi:content-save" className="h-4 w-4 mr-2" />
									{t("sys.nav.user.saveChanges", "Guardar cambios")}
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="password">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Icon icon="mdi:lock" className="h-5 w-5" />
								{t("sys.nav.user.password", "Contraseña")}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="currentPassword">{t("sys.nav.user.currentPassword", "Contraseña actual")} *</Label>
									<Input
										id="currentPassword"
										type="password"
										value={passwordData.currentPassword}
										onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
										placeholder={t("sys.nav.user.currentPasswordPlaceholder", "Ingrese su contraseña actual")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="newPassword">{t("sys.nav.user.newPassword", "Nueva contraseña")} *</Label>
									<Input
										id="newPassword"
										type="password"
										value={passwordData.newPassword}
										onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
										placeholder={t("sys.nav.user.newPasswordPlaceholder", "Ingrese su nueva contraseña")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">
										{t("sys.nav.user.confirmPassword", "Confirmar la contraseña")} *
									</Label>
									<Input
										id="confirmPassword"
										type="password"
										value={passwordData.confirmPassword}
										onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
										placeholder={t("sys.nav.user.confirmPasswordPlaceholder", "Confirme su nueva contraseña")}
									/>
								</div>
							</div>

							<div className="flex justify-center pt-4">
								<Button onClick={handleSavePassword} className="bg-primary hover:bg-primary/90 text-white">
									<Icon icon="mdi:content-save" className="h-4 w-4 mr-2" />
									{t("sys.nav.user.saveChanges", "Guardar cambios")}
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default UserProfile;

import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { Icon } from "@/components/icon";
import { useRouter } from "@/core/routes/hooks";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { cn } from "@/core/utils";
import { useLoginStateContext } from "@/features/auth/presentation/hooks/login-provider";
import { useUserActions, useUserInfo } from "@/features/auth/presentation/hooks/userStore";

/**
 * Get initials from name
 */
function getInitials(nombre?: string, apellido?: string): string {
	const first = nombre?.charAt(0)?.toUpperCase() || "";
	const last = apellido?.charAt(0)?.toUpperCase() || nombre?.charAt(1)?.toUpperCase() || "";
	return `${first}${last}` || "U";
}

/**
 * Avatar with initials component
 */
function AvatarInitials({ nombre, apellido, className }: { nombre?: string; apellido?: string; className?: string }) {
	const initials = getInitials(nombre, apellido);
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-full bg-primary text-white font-semibold",
				className
			)}
		>
			{initials}
		</div>
	);
}

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const { nombre, apellido, email, avatar } = useUserInfo();
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();

	const logout = () => {
		try {
			clearUserInfoAndToken();
			backToLogin();
		} catch (error) {
			// Handle error silently
		} finally {
			replace("/auth/login");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0">
					{avatar ? (
						<img className="h-10 w-10 rounded-full" src={avatar} alt={nombre} />
					) : (
						<AvatarInitials nombre={nombre} apellido={apellido} className="h-10 w-10 text-sm" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="flex items-center gap-2 p-2">
					{avatar ? (
						<img className="h-10 w-10 rounded-full" src={avatar} alt={nombre} />
					) : (
						<AvatarInitials nombre={nombre} apellido={apellido} className="h-10 w-10 text-sm" />
					)}
					<div className="flex flex-col items-start">
						<div className="text-text-primary text-sm font-medium">{nombre} {apellido}</div>
						<div className="text-text-secondary text-xs">{email}</div>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<NavLink to="/management/user/profile" className="flex items-center gap-2">
						<Icon icon="mdi:account" className="h-8 w-8" />
						{t("sys.nav.user.profile")}
					</NavLink>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="font-bold text-primary flex items-center gap-2" onClick={logout}>
					<Icon icon="mdi:logout" className="h-8 w-8" />
					{t("sys.login.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

import { m } from "motion/react";
import { useMemo } from "react";
import MotionContainer from "@/components/animate/motion-container";
import { getVariant } from "@/components/animate/variants";
import { themeVars } from "@/core/theme/theme.css";

type Props = {
	variant: string;
};
export default function ContainerView({ variant }: Props) {
	const varients = useMemo(() => getVariant(variant), [variant]);
	const isKenburns = variant.includes("kenburns");

	return (
		<div
			key={variant}
			className="h-[480px] overflow-hidden rounded-lg"
			style={{ backgroundColor: themeVars.colors.background.neutral }}
		>
			<MotionContainer className="flex h-full w-full flex-col items-center gap-6">
				{isKenburns ? (
					<m.div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/10" {...varients} />
				) : (
					<m.div {...varients} className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
				)}
			</MotionContainer>
		</div>
	);
}

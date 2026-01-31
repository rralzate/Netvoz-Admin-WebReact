import { m } from "motion/react";
import { useMemo } from "react";
import MotionContainer from "@/components/animate/motion-container";
import { getVariant } from "@/components/animate/variants";
import { themeVars } from "@/core/theme/theme.css";

const TEXT = "SlashAdmin";
type Props = {
	isText: boolean;
	isMulti: boolean;
	variant: string;
};
export default function ContainerView({ isText, variant, isMulti }: Props) {
	const varients = useMemo(() => getVariant(variant), [variant]);
	const imgCount = isMulti ? 5 : 1;

	return (
		<div
			key={variant}
			className="h-[480px] overflow-auto rounded-lg flex flex-col items-center justify-center"
			style={{ backgroundColor: themeVars.colors.background.neutral }}
		>
			{isText ? (
				<MotionContainer className="flex h-[480px] items-center justify-center font-bold md:text-6xl">
					{TEXT.split("").map((letter) => (
						<m.div key={letter} variants={varients}>
							{letter}
						</m.div>
					))}
				</MotionContainer>
			) : (
				<MotionContainer className="flex flex-col items-center justify-center gap-6">
					{Array.from({ length: imgCount }).map((_, idx) => (
						<m.div
							key={idx}
							className="bg-gradient-to-br from-primary/30 to-primary/10"
							style={{
								width: "240px",
								height: isMulti ? "36px" : "240px",
								margin: "auto",
								borderRadius: "8px",
							}}
							variants={varients}
						/>
					))}
				</MotionContainer>
			)}
		</div>
	);
}

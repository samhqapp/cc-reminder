import { StyleSheet, Text, ViewStyle, StyleProp } from "react-native";
import { PressableScale } from "./PressableScale";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { radius, thickness } from "@/constants/Tokens";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger";

type Props = {
	title: string;
	onPress: () => void;
	variant?: ButtonVariant;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
};

export function Button({
	title,
	onPress,
	variant = "primary",
	disabled,
	style,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	let backgroundColor = palette.primary;
	let borderColor = palette.primaryBorder;
	let textColor = palette.onPrimary;

	if (variant === "secondary") {
		backgroundColor = "transparent";
		borderColor = palette.border3D;
		textColor = palette.muted;
	} else if (variant === "success") {
		backgroundColor = palette.success;
		borderColor = palette.successBorder;
		textColor = palette.onPrimary;
	} else if (variant === "danger") {
		backgroundColor = palette.danger;
		borderColor = palette.dangerBorder;
		textColor = palette.onPrimary;
	}

	return (
		<PressableScale
			onPress={onPress}
			disabled={disabled}
			contentStyle={[
				styles.button,
				{
					backgroundColor,
					borderColor: variant === "secondary" ? palette.border : borderColor,
					borderBottomColor: borderColor,
					borderBottomWidth: thickness.border3D,
				},
				style,
			]}
		>
			<Text style={[styles.label, { color: textColor }]}>{title}</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	button: {
		borderWidth: thickness.border,
		borderRadius: radius.pill,
		paddingHorizontal: 24,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	label: {
		fontSize: 16,
		lineHeight: 20,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});

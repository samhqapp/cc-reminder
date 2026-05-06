import { StyleSheet, Text, type ViewStyle, type StyleProp } from "react-native";
import { PressableScale } from "./PressableScale";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { hairline, radius, type as typeTokens } from "@/constants/Tokens";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger";

type Props = {
	title: string;
	onPress: () => void;
	variant?: ButtonVariant;
	disabled?: boolean;
	compact?: boolean;
	style?: StyleProp<ViewStyle>;
};

export function Button({
	title,
	onPress,
	variant = "primary",
	disabled,
	compact,
	style,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	let backgroundColor: string = palette.primary;
	let borderColor: string = palette.primary;
	let textColor: string = palette.onPrimary;

	if (variant === "secondary") {
		backgroundColor = "transparent";
		borderColor = palette.border;
		textColor = palette.text;
	} else if (variant === "success") {
		backgroundColor = palette.success;
		borderColor = palette.success;
		textColor = "#ffffff";
	} else if (variant === "danger") {
		backgroundColor = palette.danger;
		borderColor = palette.danger;
		textColor = "#ffffff";
	}

	return (
		<PressableScale
			onPress={onPress}
			disabled={disabled}
			contentStyle={[
				styles.button,
				compact && styles.compact,
				{
					backgroundColor,
					borderColor,
					opacity: disabled ? 0.5 : 1,
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
		borderWidth: hairline,
		borderRadius: radius.lg,
		paddingHorizontal: 24,
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	compact: {
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	label: {
		...typeTokens.button,
	},
});

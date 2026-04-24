import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";

type Props = TextInputProps & {
	label: string;
	hint?: string;
	minHeight?: number;
};

export function TextField({ label, hint, minHeight, style, ...props }: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<View style={styles.wrapper}>
			<Text style={[styles.label, { color: palette.text }]}>{label}</Text>
			<TextInput
				{...props}
				placeholderTextColor={palette.muted}
				style={[
					styles.input,
					{
						color: palette.text,
						backgroundColor: palette.cardAlt,
						borderColor: palette.borderSoft,
					},
					minHeight ? { minHeight } : undefined,
					style,
				]}
			/>
			{hint ? (
				<Text style={[styles.hint, { color: palette.muted }]}>{hint}</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		gap: 6,
	},
	label: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 14,
		lineHeight: 18,
	},
	input: {
		fontFamily: "Nunito_700Bold",
		borderWidth: thickness.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.md,
		paddingVertical: 14,
		fontSize: 16,
		lineHeight: 22,
	},
	hint: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 12,
		lineHeight: 18,
	},
});

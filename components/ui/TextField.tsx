import type { TextInputProps } from "react-native";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
	hairline,
	radius,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";

type Props = TextInputProps & {
	label: string;
	hint?: string;
	error?: string;
	minHeight?: number;
};

export function TextField({ label, hint, error, minHeight, style, ...props }: Props) {
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
						borderColor: error ? palette.danger : palette.border,
					},
					minHeight ? { minHeight } : undefined,
					style,
				]}
			/>
			{error ? (
				<Text style={[styles.hint, { color: palette.danger }]}>{error}</Text>
			) : hint ? (
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
		...typeTokens.caption,
		color: stylepass.ink,
	},
	input: {
		...typeTokens.body,
		borderWidth: hairline,
		borderRadius: radius.md,
		paddingHorizontal: spacing.md,
		paddingVertical: 12,
		fontSize: 15,
	},
	hint: {
		...typeTokens.legal,
	},
});

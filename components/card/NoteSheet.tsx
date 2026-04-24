import { StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { BottomSheet } from "@/components/ui/BottomSheet";
import Colors from "@/constants/Colors";
import { radius, spacing } from "@/constants/Tokens";

type Props = {
	visible: boolean;
	title: string;
	subtitle?: string;
	note?: string;
	onClose: () => void;
};

export function NoteSheet({
	visible,
	title,
	subtitle,
	note,
	onClose,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];

	return (
		<BottomSheet
			visible={visible}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
		>
			<View
				style={[
					styles.card,
					{ backgroundColor: palette.cardAlt, borderColor: palette.borderSoft },
				]}
			>
				<Text style={[styles.note, { color: palette.text }]}>
					{note?.trim() || "No note saved for this card yet."}
				</Text>
			</View>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: 1,
		borderRadius: radius.lg,
		padding: spacing.lg,
	},
	note: {
		fontSize: 15,
		lineHeight: 22,
		fontWeight: "600",
	},
});

import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { radius, spacing } from "@/constants/Tokens";

type Props = {
	visible: boolean;
	title: string;
	subtitle?: string;
	note?: string;
	onClose: () => void;
	/** When provided the sheet becomes editable with a Save button. */
	onSave?: (note: string) => Promise<void> | void;
};

export function NoteSheet({
	visible,
	title,
	subtitle,
	note,
	onClose,
	onSave,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const [draft, setDraft] = useState(note ?? "");
	const [isSaving, setIsSaving] = useState(false);

	// Sync draft whenever the sheet opens with new content
	useEffect(() => {
		if (visible) {
			setDraft(note ?? "");
			setIsSaving(false);
		}
	}, [visible, note]);

	async function handleSave() {
		if (!onSave) return;
		setIsSaving(true);
		await onSave(draft);
		setIsSaving(false);
	}

	const isEditable = Boolean(onSave);

	return (
		<BottomSheet
			visible={visible}
			title={title}
			subtitle={subtitle}
			onClose={onClose}
			footer={
				isEditable ? (
					<Button
						title={isSaving ? "Saving..." : "Save note"}
						onPress={() => void handleSave()}
						disabled={isSaving}
					/>
				) : undefined
			}
		>
			{isEditable ? (
				<TextField
					label="Note"
					value={draft}
					onChangeText={setDraft}
					placeholder="Cancellation link, support number, follow-up context..."
					multiline
					minHeight={120}
					autoFocus
				/>
			) : (
				<View
					style={[
						styles.readCard,
						{ backgroundColor: palette.cardAlt, borderColor: palette.borderSoft },
					]}
				>
					<Text style={[styles.noteText, { color: palette.text }]}>
						{note?.trim() || "No note saved for this card yet."}
					</Text>
				</View>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	readCard: {
		borderWidth: 1,
		borderRadius: radius.lg,
		padding: spacing.lg,
	},
	noteText: {
		fontSize: 15,
		lineHeight: 22,
		fontWeight: "600",
	},
});

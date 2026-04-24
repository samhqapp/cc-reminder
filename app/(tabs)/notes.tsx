import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { radius, spacing, thickness } from "@/constants/Tokens";
import { mapCardToDraft, useCards } from "@/hooks/useCards";
import { useQuickNotes } from "@/hooks/useQuickNotes";
import type { Card } from "@/types/domain";

export default function NotesScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const insets = useSafeAreaInsets();
	const { cards, updateCard } = useCards();
	const { notes, isReady, addNote, deleteNote } = useQuickNotes();
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [editingCard, setEditingCard] = useState<Card | null>(null);

	// Unified list: card notes first, then quick notes
	const cardNotes = useMemo(
		() => cards.filter((card) => card.note?.trim()),
		[cards],
	);

	const listPaddingBottom = Math.max(insets.bottom, 8) + 12 + 64 + 24;

	async function handleSaveQuickNote() {
		setIsSaving(true);
		const saved = await addNote(draft);
		if (saved) setDraft("");
		setIsSaving(false);
	}

	async function handleSaveCardNote(note: string) {
		if (!editingCard) return;
		const updatedDraft = { ...mapCardToDraft(editingCard), note };
		await updateCard(editingCard.id, updatedDraft);
		setEditingCard(null);
	}

	const hasContent = isReady && (cardNotes.length > 0 || notes.length > 0);

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={[styles.content, { paddingBottom: listPaddingBottom }]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<Text style={[styles.pageTitle, { color: palette.text }]}>Notes</Text>

				{/* Quick note composer */}
				<View
					style={[
						styles.composer,
						{ backgroundColor: palette.card, borderColor: palette.borderSoft },
					]}
				>
					<TextField
						label="New quick note"
						value={draft}
						onChangeText={setDraft}
						placeholder="Jot down anything — cancellation link, support number, follow-up..."
						multiline
						minHeight={96}
					/>
					<Button
						title={isSaving ? "Saving..." : "Save note"}
						onPress={() => void handleSaveQuickNote()}
						disabled={isSaving || draft.trim().length === 0}
					/>
				</View>

				{/* Loading / empty states */}
				{!isReady ? (
					<Text style={[styles.hint, { color: palette.muted }]}>Loading…</Text>
				) : null}

				{isReady && !hasContent ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.card, borderColor: palette.borderSoft },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							No notes yet
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Write a quick note above, or add notes inside a card.
						</Text>
					</View>
				) : null}

				{/* Card notes — tap to edit */}
				{cardNotes.length > 0 ? (
					<View style={styles.section}>
						<Text style={[styles.sectionLabel, { color: palette.muted }]}>
							Card notes
						</Text>
						<View style={styles.noteList}>
							{cardNotes.map((card) => (
								<PressableScale
									key={card.id}
									onPress={() => setEditingCard(card)}
									contentStyle={[
										styles.noteCard,
										{
											backgroundColor: palette.card,
											borderColor: palette.borderSoft,
										},
									]}
								>
									<View style={styles.noteCardHeader}>
										<Text style={[styles.noteCardTitle, { color: palette.text }]}>
											{card.name}
										</Text>
										<Text style={[styles.noteCardMeta, { color: palette.muted }]}>
											{card.provider}
										</Text>
									</View>
									<Text
										style={[styles.noteCardBody, { color: palette.muted }]}
										numberOfLines={3}
									>
										{card.note}
									</Text>
									<Text style={[styles.tapHint, { color: palette.primary }]}>
										Tap to edit
									</Text>
								</PressableScale>
							))}
						</View>
					</View>
				) : null}

				{/* Quick notes — deletable */}
				{notes.length > 0 ? (
					<View style={styles.section}>
						<Text style={[styles.sectionLabel, { color: palette.muted }]}>
							Quick notes
						</Text>
						<View style={styles.noteList}>
							{notes.map((note) => (
								<View
									key={note.id}
									style={[
										styles.noteCard,
										{
											backgroundColor: palette.card,
											borderColor: palette.borderSoft,
										},
									]}
								>
									<Text style={[styles.noteCardBody, { color: palette.text }]}>
										{note.body}
									</Text>
									<View style={styles.noteCardFooter}>
										<Text style={[styles.noteCardMeta, { color: palette.muted }]}>
											{new Intl.DateTimeFormat(undefined, {
												month: "short",
												day: "numeric",
											}).format(new Date(note.createdAt))}
										</Text>
										<Button
											title="Delete"
											variant="danger"
											onPress={() => void deleteNote(note.id)}
										/>
									</View>
								</View>
							))}
						</View>
					</View>
				) : null}
			</ScrollView>

			{/* Edit card note sheet */}
			<NoteSheet
				visible={Boolean(editingCard)}
				title={editingCard?.name ?? "Edit note"}
				subtitle={editingCard?.provider}
				note={editingCard?.note}
				onClose={() => setEditingCard(null)}
				onSave={handleSaveCardNote}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		padding: spacing.xl,
		gap: spacing.xl,
	},
	pageTitle: {
		fontFamily: "Nunito_900Black",
		fontSize: 32,
		marginBottom: 4,
	},
	composer: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		gap: spacing.md,
	},
	hint: {
		fontSize: 14,
		textAlign: "center",
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.xl,
		gap: spacing.sm,
	},
	emptyTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 20,
	},
	emptyBody: {
		fontFamily: "Nunito_700Bold",
		fontSize: 15,
	},
	section: {
		gap: spacing.sm,
	},
	sectionLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	noteList: {
		gap: spacing.md,
	},
	noteCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		gap: spacing.sm,
	},
	noteCardHeader: {
		gap: 2,
	},
	noteCardTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 17,
	},
	noteCardMeta: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 13,
	},
	noteCardBody: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 15,
		lineHeight: 22,
	},
	noteCardFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: spacing.xs,
	},
	tapHint: {
		fontFamily: "Nunito_700Bold",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});

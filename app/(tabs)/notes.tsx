import { useMemo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NoteSheet } from "@/components/card/NoteSheet";
import { useColorScheme } from "@/components/useColorScheme";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { radius, shadow, spacing, thickness } from "@/constants/Tokens";
import { useCards } from "@/hooks/useCards";
import { useQuickNotes } from "@/hooks/useQuickNotes";
import type { Card } from "@/types/domain";

export default function NotesScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { width } = useWindowDimensions();
	const { cards } = useCards();
	const { notes, isReady, addNote, deleteNote } = useQuickNotes();
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);

	const hPad = spacing.lg;
	const twoColumn = width >= 420;
	const tileWidth = twoColumn
		? (width - hPad * 2 - spacing.md) / 2
		: width - hPad * 2;

	// Cards that have a note saved
	const cardNotes = useMemo(
		() => cards.filter((card) => card.note?.trim()),
		[cards],
	);

	async function handleSave() {
		setIsSaving(true);
		const saved = await addNote(draft);
		if (saved) {
			setDraft("");
		}
		setIsSaving(false);
	}

	return (
		<SafeAreaView
			edges={["top"]}
			style={[styles.safeArea, { backgroundColor: palette.background }]}
		>
			<ScrollView
				style={{ backgroundColor: palette.background }}
				contentContainerStyle={[styles.content, { paddingHorizontal: hPad }]}
				showsVerticalScrollIndicator={false}
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
						label="Quick note"
						value={draft}
						onChangeText={setDraft}
						placeholder="Jot something down…"
						multiline
						minHeight={80}
					/>
					<PressableScale
						onPress={() => void handleSave()}
						disabled={isSaving || !draft.trim()}
						contentStyle={[
							styles.saveBtn,
							{
								backgroundColor: draft.trim() ? palette.primary : palette.cardAlt,
								borderColor: draft.trim() ? palette.primaryBorder : palette.borderSoft,
								borderBottomColor: draft.trim()
									? palette.primaryBorder
									: palette.borderSoft,
							},
						]}
					>
						<Text
							style={[
								styles.saveBtnLabel,
								{ color: draft.trim() ? palette.onPrimary : palette.muted },
							]}
						>
							{isSaving ? "Saving…" : "Save"}
						</Text>
					</PressableScale>
				</View>

				{/* Loading state */}
				{!isReady ? (
					<Text style={[styles.loading, { color: palette.muted }]}>Loading…</Text>
				) : null}

				{/* Empty state */}
				{isReady && notes.length === 0 && cardNotes.length === 0 ? (
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
							Quick notes appear here. Card-level notes show up once you add them to
							a card.
						</Text>
					</View>
				) : null}

				{/* Quick notes */}
				{notes.length > 0 ? (
					<>
						<Text style={[styles.sectionLabel, { color: palette.muted }]}>
							Quick notes
						</Text>
						<View style={styles.grid}>
							{notes.map((note) => (
								<View
									key={note.id}
									style={[
										styles.tile,
										{
											width: tileWidth,
											backgroundColor: palette.card,
											borderColor: palette.borderSoft,
										},
										shadow.soft,
									]}
								>
									<Text style={[styles.tileBody, { color: palette.text }]}>
										{note.body}
									</Text>
									<Text style={[styles.tileMeta, { color: palette.muted }]}>
										{new Intl.DateTimeFormat(undefined, {
											month: "short",
											day: "numeric",
										}).format(new Date(note.createdAt))}
									</Text>
									<PressableScale
										onPress={() => void deleteNote(note.id)}
										contentStyle={[
											styles.deleteBtn,
											{ borderColor: palette.borderSoft },
										]}
									>
										<Text style={[styles.deleteBtnLabel, { color: palette.muted }]}>
											Delete
										</Text>
									</PressableScale>
								</View>
							))}
						</View>
					</>
				) : null}

				{/* Card notes */}
				{cardNotes.length > 0 ? (
					<>
						<Text style={[styles.sectionLabel, { color: palette.muted }]}>
							From cards
						</Text>
						<View style={styles.grid}>
							{cardNotes.map((card) => (
								<PressableScale
									key={card.id}
									onPress={() => setSelectedCard(card)}
									contentStyle={[
										styles.tile,
										{
											width: tileWidth,
											backgroundColor: palette.card,
											borderColor: palette.borderSoft,
										},
										shadow.soft,
									]}
								>
									<Text
										style={[styles.tileTitle, { color: palette.text }]}
										numberOfLines={1}
									>
										{card.name}
									</Text>
									<Text style={[styles.tileMeta, { color: palette.muted }]}>
										{card.provider}
									</Text>
									<Text
										style={[styles.tileBody, { color: palette.text }]}
										numberOfLines={4}
									>
										{card.note}
									</Text>
									<Text style={[styles.tapHint, { color: palette.primary }]}>
										Tap to view
									</Text>
								</PressableScale>
							))}
						</View>
					</>
				) : null}
			</ScrollView>

			<NoteSheet
				visible={Boolean(selectedCard)}
				title={selectedCard?.name ?? "Note"}
				subtitle={selectedCard?.provider}
				note={selectedCard?.note}
				onClose={() => setSelectedCard(null)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	content: {
		paddingTop: spacing.lg,
		paddingBottom: 120,
		gap: spacing.lg,
	},
	pageTitle: {
		fontFamily: "Nunito_900Black",
		fontSize: 28,
		marginBottom: 4,
	},
	composer: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.md,
		gap: spacing.sm,
	},
	saveBtn: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.pill,
		paddingVertical: 12,
		alignItems: "center",
	},
	saveBtnLabel: {
		fontFamily: "Nunito_900Black",
		fontSize: 14,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	loading: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
		textAlign: "center",
	},
	emptyCard: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.xl,
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 18,
	},
	emptyBody: {
		fontFamily: "Nunito_700Bold",
		fontSize: 14,
		lineHeight: 20,
	},
	sectionLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 1,
		marginBottom: -spacing.xs,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.md,
	},
	tile: {
		borderWidth: thickness.border,
		borderBottomWidth: thickness.border3D,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.xs,
	},
	tileTitle: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 16,
		lineHeight: 20,
	},
	tileMeta: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 12,
		lineHeight: 16,
	},
	tileBody: {
		fontFamily: "Nunito_600SemiBold",
		fontSize: 14,
		lineHeight: 20,
	},
	deleteBtn: {
		borderWidth: 1,
		borderRadius: radius.pill,
		paddingVertical: 6,
		paddingHorizontal: 14,
		alignSelf: "flex-start",
		marginTop: 2,
	},
	deleteBtnLabel: {
		fontFamily: "Nunito_800ExtraBold",
		fontSize: 12,
		textTransform: "uppercase",
	},
	tapHint: {
		fontFamily: "Nunito_700Bold",
		fontSize: 12,
		marginTop: 2,
	},
});

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
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import { hairline, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { useCards } from "@/hooks/useCards";
import { useQuickNotes } from "@/hooks/useQuickNotes";
import type { Card } from "@/types/domain";

export default function NotesScreen() {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const { width } = useWindowDimensions();
	const { cards } = useCards();
	const { notes, isReady, addNote, deleteNote, updateNote } = useQuickNotes();
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingBody, setEditingBody] = useState("");

	const hPad = spacing.lg;
	const twoColumn = width >= 420;
	const tileWidth = twoColumn
		? (width - hPad * 2 - spacing.sm) / 2
		: width - hPad * 2;

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

	function startEditing(id: string, body: string) {
		setEditingId(id);
		setEditingBody(body);
	}

	async function saveEdit() {
		if (editingId && editingBody.trim()) {
			await updateNote(editingId, editingBody.trim());
		}
		setEditingId(null);
		setEditingBody("");
	}

	function cancelEdit() {
		setEditingId(null);
		setEditingBody("");
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
						{ backgroundColor: palette.card, borderColor: palette.border },
					]}
				>
					<TextField
						label="Quick note"
						value={draft}
						onChangeText={setDraft}
						placeholder="Jot something down..."
						multiline
						minHeight={72}
					/>
					<Button
						title={isSaving ? "Saving..." : "Save note"}
						variant="primary"
						compact
						onPress={() => void handleSave()}
						disabled={isSaving || !draft.trim()}
					/>
				</View>

				{/* Loading state */}
				{!isReady ? (
					<Text style={[styles.loading, { color: palette.muted }]}>
						Loading...
					</Text>
				) : null}

				{/* Empty state */}
				{isReady && notes.length === 0 && cardNotes.length === 0 ? (
					<View
						style={[
							styles.emptyCard,
							{ backgroundColor: palette.surface, borderColor: palette.border },
						]}
					>
						<Text style={[styles.emptyTitle, { color: palette.text }]}>
							No notes yet
						</Text>
						<Text style={[styles.emptyBody, { color: palette.muted }]}>
							Quick notes appear here. Card-level notes show up once you add
							them to a card.
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
							{notes.map((note) => {
								const isEditing = editingId === note.id;
								return (
									<View
										key={note.id}
										style={[
											styles.tile,
											{
												width: tileWidth,
												backgroundColor: palette.card,
												borderColor: palette.border,
											},
										]}
									>
										{isEditing ? (
											<>
												<TextField
													label="Edit note"
													value={editingBody}
													onChangeText={setEditingBody}
													multiline
													minHeight={60}
												/>
												<View style={styles.editActions}>
													<Button
														title="Save"
														variant="primary"
														compact
														style={{ flex: 1 }}
														onPress={() => void saveEdit()}
													/>
													<Button
														title="Cancel"
														variant="secondary"
														compact
														style={{ flex: 1 }}
														onPress={cancelEdit}
													/>
												</View>
											</>
										) : (
											<>
												<Text
													style={[styles.tileBody, { color: palette.text }]}
												>
													{note.body}
												</Text>
												<Text
													style={[styles.tileMeta, { color: palette.muted }]}
												>
													{new Intl.DateTimeFormat(undefined, {
														month: "short",
														day: "numeric",
													}).format(new Date(note.createdAt))}
												</Text>
												<View style={styles.tileActions}>
													<PressableScale
														onPress={() => startEditing(note.id, note.body)}
														contentStyle={styles.tileBtn}
													>
														<Text
															style={[styles.tileBtnLabel, { color: palette.link }]}
														>
															Edit
														</Text>
													</PressableScale>
													<PressableScale
														onPress={() => void deleteNote(note.id)}
														contentStyle={styles.tileBtn}
													>
														<Text
															style={[
																styles.tileBtnLabel,
																{ color: palette.danger },
															]}
														>
															Delete
														</Text>
													</PressableScale>
												</View>
											</>
										)}
									</View>
								);
							})}
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
											borderColor: palette.border,
										},
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
										style={[styles.tileBody, { color: palette.body }]}
										numberOfLines={4}
									>
										{card.note}
									</Text>
									<Text style={[styles.viewLink, { color: palette.link }]}>
										View full note
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
		gap: spacing.md,
	},
	pageTitle: {
		...typeTokens.displayLg,
		marginBottom: spacing.xs,
	},
	composer: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.sm,
	},
	loading: {
		...typeTokens.body,
		textAlign: "center",
	},
	emptyCard: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.lg,
		gap: spacing.xs,
	},
	emptyTitle: {
		...typeTokens.titleMd,
	},
	emptyBody: {
		...typeTokens.body,
	},
	sectionLabel: {
		...typeTokens.caption,
		textTransform: "uppercase" as const,
		letterSpacing: 1,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing.sm,
	},
	tile: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		padding: spacing.md,
		gap: spacing.xs,
	},
	tileTitle: {
		...typeTokens.titleSm,
	},
	tileMeta: {
		...typeTokens.legal,
	},
	tileBody: {
		...typeTokens.body,
	},
	tileActions: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: 4,
	},
	tileBtn: {
		paddingVertical: 2,
	},
	tileBtnLabel: {
		...typeTokens.caption,
	},
	editActions: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	viewLink: {
		...typeTokens.legal,
		marginTop: 4,
	},
});

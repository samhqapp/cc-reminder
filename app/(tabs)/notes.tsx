import { useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { NoteSheet } from "@/components/card/NoteSheet";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import {
	AnimatedAppear,
	PaperPanel,
	ScreenScaffold,
} from "@/components/ui/ScreenScaffold";
import { TextField } from "@/components/ui/TextField";
import {
	hairline,
	radius,
	screenWorld,
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";
import { useCards } from "@/hooks/useCards";
import { useQuickNotes } from "@/hooks/useQuickNotes";
import type { Card } from "@/types/domain";

const noteArt = require("../../assets/images/onboarding/private-notes.png");

export default function NotesScreen() {
	const { cards } = useCards();
	const { notes, isReady, addNote, deleteNote, updateNote } = useQuickNotes();
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [selectedCard, setSelectedCard] = useState<Card | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingBody, setEditingBody] = useState("");
	const [showInfoCard, setShowInfoCard] = useState(true);

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
		<ScreenScaffold
			world="notes"
			kicker="Renewal Notebook"
			title="Notes"
			subtitle="Private cancellation and renewal details kept close."
		>
			{showInfoCard ? (
				<AnimatedAppear delay={80}>
					<PaperPanel style={styles.noteHero}>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Hide notes info"
							onPress={() => setShowInfoCard(false)}
							hitSlop={10}
							style={styles.dismissButton}
						>
							<Ionicons name="close" size={17} color="rgba(21, 24, 33, 0.62)" />
						</Pressable>
						<View style={styles.heroCopy}>
							<Text style={styles.heroTitle}>Keep Details Close</Text>
							<Text style={styles.heroBody}>
								Cancellation links, support numbers, downgrade paths, and why a
								renewal matters stay local.
							</Text>
						</View>
						<Image source={noteArt} style={styles.noteArt} resizeMode="contain" />
					</PaperPanel>
				</AnimatedAppear>
			) : null}

			<AnimatedAppear delay={120}>
				<PaperPanel style={styles.composer}>
					<TextField
						label="Quick note"
						value={draft}
						onChangeText={setDraft}
						placeholder="Jot something down..."
						multiline
						minHeight={86}
						style={styles.notebookField}
					/>
					<Button
						title={isSaving ? "Saving..." : "Save note"}
						variant="primary"
						compact
						onPress={() => void handleSave()}
						disabled={isSaving || !draft.trim()}
					/>
				</PaperPanel>
			</AnimatedAppear>

			{!isReady ? (
				<Text style={styles.loading}>Loading...</Text>
			) : null}

			{isReady && notes.length === 0 && cardNotes.length === 0 ? (
				<AnimatedAppear delay={150}>
					<PaperPanel style={styles.emptyPanel}>
						<Text style={styles.emptyTitle}>No notes yet</Text>
						<Text style={styles.emptyBody}>
							Quick notes and card-level renewal notes will stack here.
						</Text>
					</PaperPanel>
				</AnimatedAppear>
			) : null}

			{notes.length > 0 ? (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Quick Notes</Text>
					<View style={styles.noteSheet}>
						{notes.map((note, index) => {
							const isEditing = editingId === note.id;
							return (
								<AnimatedAppear key={note.id} delay={170 + index * 45}>
									<View style={styles.noteLineWrap}>
										{isEditing ? (
											<View style={styles.editBlock}>
												<TextField
													label="Edit note"
													value={editingBody}
													onChangeText={setEditingBody}
													multiline
													minHeight={70}
												/>
												<View style={styles.editActions}>
													<Button
														title="Save"
														variant="primary"
														compact
														style={styles.editButton}
														onPress={() => void saveEdit()}
													/>
													<Button
														title="Cancel"
														variant="secondary"
														compact
														style={styles.editButton}
														onPress={cancelEdit}
													/>
												</View>
											</View>
										) : (
											<View style={styles.noteLine}>
												<View style={styles.noteCopy}>
													<Text style={styles.noteBody}>{note.body}</Text>
													<Text style={styles.noteMeta}>
														{new Intl.DateTimeFormat(undefined, {
															month: "short",
															day: "numeric",
														}).format(new Date(note.createdAt))}
													</Text>
												</View>
												<View style={styles.noteActions}>
													<PressableScale
														onPress={() => startEditing(note.id, note.body)}
														contentStyle={styles.noteBtn}
													>
														<Text style={styles.noteBtnLabel}>Edit</Text>
													</PressableScale>
													<PressableScale
														onPress={() => void deleteNote(note.id)}
														contentStyle={styles.noteBtn}
													>
														<Text style={[styles.noteBtnLabel, styles.deleteLabel]}>
															Delete
														</Text>
													</PressableScale>
												</View>
											</View>
										)}
									</View>
								</AnimatedAppear>
							);
						})}
					</View>
				</View>
			) : null}

			{cardNotes.length > 0 ? (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>From Cards</Text>
					<View style={styles.cardNoteStack}>
						{cardNotes.map((card, index) => (
							<AnimatedAppear key={card.id} delay={190 + index * 45}>
								<PressableScale
									onPress={() => setSelectedCard(card)}
									contentStyle={styles.cardNote}
								>
									<View style={styles.cardNoteAccent} />
									<View style={styles.cardNoteCopy}>
										<Text style={styles.cardNoteTitle} numberOfLines={1}>
											{card.name}
										</Text>
										<Text style={styles.cardNoteMeta}>{card.provider}</Text>
										<Text style={styles.cardNoteBody} numberOfLines={4}>
											{card.note}
										</Text>
									</View>
									<Text style={styles.viewLink}>View Full Note</Text>
								</PressableScale>
							</AnimatedAppear>
						))}
					</View>
				</View>
			) : null}

			<NoteSheet
				visible={Boolean(selectedCard)}
				title={selectedCard?.name ?? "Note"}
				subtitle={selectedCard?.provider}
				note={selectedCard?.note}
				onClose={() => setSelectedCard(null)}
			/>
		</ScreenScaffold>
	);
}

const styles = StyleSheet.create({
	noteHero: {
		position: "relative",
		minHeight: 178,
		padding: spacing.md,
		overflow: "hidden",
		marginBottom: spacing.lg,
	},
	dismissButton: {
		position: "absolute",
		top: spacing.sm,
		right: spacing.sm,
		zIndex: 4,
		width: 34,
		height: 34,
		alignItems: "center",
		justifyContent: "center",
	},
	heroCopy: {
		maxWidth: 210,
		zIndex: 2,
	},
	heroTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	heroBody: {
		...typeTokens.legal,
		marginTop: spacing.xs,
		color: "rgba(21, 24, 33, 0.62)",
	},
	noteArt: {
		position: "absolute",
		right: -18,
		bottom: -408,
		width: 152,
		height: 510,
		opacity: 0.9,
	},
	composer: {
		padding: spacing.md,
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	notebookField: {
		backgroundColor: "rgba(255, 247, 233, 0.48)",
	},
	loading: {
		...typeTokens.body,
		textAlign: "center",
		color: "rgba(21, 24, 33, 0.58)",
	},
	emptyPanel: {
		padding: spacing.lg,
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	emptyTitle: {
		...typeTokens.titleLg,
		color: stylepass.ink,
	},
	emptyBody: {
		...typeTokens.body,
		color: stylepass.body,
	},
	section: {
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	sectionLabel: {
		...typeTokens.legal,
		color: "rgba(21, 24, 33, 0.58)",
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	noteSheet: {
		...shadow.soft,
		borderRadius: radius.md,
		overflow: "hidden",
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.12)",
		backgroundColor: "rgba(255, 247, 233, 0.62)",
	},
	noteLineWrap: {
		borderBottomWidth: hairline,
		borderBottomColor: "rgba(21, 24, 33, 0.1)",
	},
	noteLine: {
		minHeight: 62,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
	},
	noteCopy: {
		flex: 1,
		minWidth: 0,
	},
	noteBody: {
		...typeTokens.body,
		color: "rgba(21, 24, 33, 0.72)",
	},
	noteMeta: {
		...typeTokens.legal,
		marginTop: 3,
		color: "rgba(21, 24, 33, 0.5)",
	},
	noteActions: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	noteBtn: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: radius.sm,
	},
	noteBtnLabel: {
		...typeTokens.legal,
		color: stylepass.forest,
	},
	deleteLabel: {
		color: stylepass.rust,
	},
	editBlock: {
		padding: spacing.md,
		gap: spacing.sm,
	},
	editActions: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	editButton: {
		flex: 1,
	},
	cardNoteStack: {
		gap: spacing.sm,
	},
	cardNote: {
		...shadow.soft,
		position: "relative",
		overflow: "hidden",
		borderRadius: radius.md,
		borderWidth: hairline,
		borderColor: "rgba(21, 24, 33, 0.12)",
		backgroundColor: "rgba(255, 255, 255, 0.44)",
		padding: spacing.md,
		gap: spacing.xs,
	},
	cardNoteAccent: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: 5,
		backgroundColor: screenWorld.notes.accentSoft,
	},
	cardNoteCopy: {
		paddingLeft: spacing.xs,
	},
	cardNoteTitle: {
		...typeTokens.titleSm,
		color: stylepass.ink,
	},
	cardNoteMeta: {
		...typeTokens.legal,
		marginTop: 3,
		color: "rgba(21, 24, 33, 0.52)",
	},
	cardNoteBody: {
		...typeTokens.body,
		marginTop: spacing.xs,
		color: "rgba(21, 24, 33, 0.66)",
	},
	viewLink: {
		...typeTokens.legal,
		alignSelf: "flex-start",
		color: stylepass.forest,
		paddingLeft: spacing.xs,
	},
});

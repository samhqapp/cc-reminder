import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/useColorScheme";
import { Button } from "@/components/ui/Button";
import { PressableScale } from "@/components/ui/PressableScale";
import { TextField } from "@/components/ui/TextField";
import Colors from "@/constants/Colors";
import {
	hairline,
	radius,
	shadow,
	spacing,
	stylepass,
	type as typeTokens,
} from "@/constants/Tokens";
import { providerTemplates } from "@/data/providerTemplates";
import type { CardDraft } from "@/types/domain";

const EXTENDED_WARNING =
	"Grace periods, extension windows, minimum-payment effects, late fees, and credit-reporting outcomes depend on your specific card agreement and may change without notice. CC Reminder cannot monitor your issuer's policies.";

const EXTENDED_RESPONSIBILITY =
	"By enabling extended payment tracking, you acknowledge that any extended date shown here is only a memory aid. It is not a guarantee, not legal advice, not financial advice, and may still be wrong for your card. You are responsible for verifying the actual terms directly with your issuer.";

type Props = {
	title: string;
	subtitle: string;
	initialDraft: CardDraft;
	submitLabel: string;
	onSubmit: (draft: CardDraft) => Promise<string | null>;
	onDelete?: () => Promise<void>;
};

export function CardForm({
	title,
	subtitle,
	initialDraft,
	submitLabel,
	onSubmit,
	onDelete,
}: Props) {
	const colorScheme = useColorScheme() ?? "light";
	const palette = Colors[colorScheme];
	const [draft, setDraft] = useState<CardDraft>(initialDraft);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);

	const template = useMemo(
		() =>
			providerTemplates.find((item) => item.id === draft.providerTemplateId),
		[draft.providerTemplateId],
	);

	function update(next: Partial<CardDraft>) {
		setDraft((current) => ({ ...current, ...next }));
	}

	function handleExtendedToggle() {
		if (!draft.extendedTrackingEnabled) {
			setShowWarning(true);
		} else {
			update({
				extendedTrackingEnabled: false,
				acknowledgmentAccepted: false,
			});
		}
	}

	function acceptWarning() {
		update({
			extendedTrackingEnabled: true,
			acknowledgmentAccepted: true,
		});
		setShowWarning(false);
	}

	async function handleSubmit() {
		setIsSaving(true);
		const nextError = await onSubmit(draft);
		setError(nextError);
		setIsSaving(false);
	}

	return (
		<ScrollView
			style={{ backgroundColor: palette.background }}
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.headerSection}>
				<Text style={[styles.formTitle, { color: palette.text }]}>{title}</Text>
				<Text style={[styles.formSubtitle, { color: palette.muted }]}>
					{subtitle}
				</Text>
			</View>

			<View style={[styles.section, { borderColor: palette.border }]}>
				<TextField
					label="Company or label"
					value={draft.provider}
					onChangeText={(value) => update({ provider: value })}
					placeholder="Example: Netflix"
					hint="Required unless you add a nickname in Advanced."
				/>
				<TextField
					label="Renewal day"
					value={draft.dueDay}
					onChangeText={(value) =>
						update({
							dueDay: value.replace(/[^0-9]/g, "").slice(0, 2),
						})
					}
					placeholder="25"
					hint="Required, monthly 1-31."
					keyboardType="number-pad"
				/>
			</View>

			<PressableScale
				accessibilityRole="button"
				onPress={() => setShowAdvanced((current) => !current)}
				contentStyle={[styles.advancedToggle, { borderColor: palette.border }]}
			>
				<Text style={[styles.advancedTitle, { color: palette.text }]}>
					{showAdvanced ? "Hide advanced" : "Advanced"}
				</Text>
				<Text style={[styles.advancedMeta, { color: palette.muted }]}>
					{showAdvanced ? "Collapse optional fields" : "Optional details"}
				</Text>
			</PressableScale>

			{showAdvanced ? (
				<View style={[styles.section, { borderColor: palette.border }]}>
					<Text style={[styles.sectionTitle, { color: palette.text }]}>
						Optional details
					</Text>
					<TextField
						label="Card nickname"
						value={draft.name}
						onChangeText={(value) => update({ name: value })}
						placeholder="Example: Everyday Gold"
						hint="Optional. Uses company or label when blank."
					/>
					<TextField
						label="Last 4 digits"
						value={draft.last4}
						onChangeText={(value) =>
							update({ last4: value.replace(/[^0-9]/g, "").slice(0, 4) })
						}
						placeholder="0123"
						hint="Optional."
						keyboardType="number-pad"
					/>
					<TextField
						label="Billing day"
						value={draft.billingDay}
						onChangeText={(value) =>
							update({
								billingDay: value.replace(/[^0-9]/g, "").slice(0, 2),
							})
						}
						placeholder="1-31"
						hint="Optional."
						keyboardType="number-pad"
					/>
					<TextField
						label="Tags"
						value={draft.tags}
						onChangeText={(value) => update({ tags: value })}
						placeholder="travel, backup"
						hint="Optional, comma-separated."
					/>
					<TextField
						label="Note"
						value={draft.note}
						onChangeText={(value) => update({ note: value })}
						placeholder="Cancellation link, phone number, or reminder"
						multiline
						minHeight={72}
					/>

					<Text style={[styles.sectionTitle, { color: palette.text }]}>
						Preferences
					</Text>
					<PressableScale
						onPress={() =>
							update({ notificationsEnabled: !draft.notificationsEnabled })
						}
						contentStyle={[styles.toggle, { borderColor: palette.border }]}
					>
						<Text style={[styles.toggleLabel, { color: palette.text }]}>
							Notifications
						</Text>
						<View
							style={[
								styles.toggleDot,
								{
									backgroundColor: draft.notificationsEnabled
										? palette.success
										: palette.border,
								},
							]}
						/>
					</PressableScale>

					<PressableScale
						onPress={handleExtendedToggle}
						contentStyle={[styles.toggle, { borderColor: palette.border }]}
					>
						<Text style={[styles.toggleLabel, { color: palette.text }]}>
							Extended tracking
						</Text>
						<View
							style={[
								styles.toggleDot,
								{
									backgroundColor: draft.extendedTrackingEnabled
										? palette.success
										: palette.border,
								},
							]}
						/>
					</PressableScale>
					<Text style={[styles.hint, { color: palette.muted }]}>
						Keep this off unless you want to manage a manual follow-up window.
					</Text>
				</View>
			) : null}

			{showAdvanced && showWarning ? (
				<View
					style={[
						styles.warningSection,
						{ backgroundColor: palette.warningSoft, borderColor: palette.warning },
					]}
				>
					<Text style={[styles.warningTitle, { color: palette.text }]}>
						Extended tracking acknowledgment
					</Text>
					<Text style={[styles.warningBody, { color: palette.body }]}>
						{EXTENDED_WARNING}
					</Text>
					<Text style={[styles.warningBody, { color: palette.muted }]}>
						{EXTENDED_RESPONSIBILITY}
					</Text>
					<View style={styles.warningActions}>
						<Button
							title="I understand, enable it"
							variant="primary"
							compact
							onPress={acceptWarning}
							style={{ flex: 1 }}
						/>
						<Button
							title="Cancel"
							variant="secondary"
							compact
							onPress={() => setShowWarning(false)}
							style={{ flex: 1 }}
						/>
					</View>
				</View>
			) : null}

			{showAdvanced && draft.extendedTrackingEnabled ? (
				<View style={[styles.section, { borderColor: palette.border }]}>
					<Text style={[styles.sectionTitle, { color: palette.text }]}>
						Extended tracking
					</Text>

					<Text style={[styles.hint, { color: palette.muted }]}>
						Provider template (advisory only)
					</Text>
					{providerTemplates.map((item) => (
						<PressableScale
							key={item.id}
							onPress={() =>
								update({
									provider: item.provider,
									providerTemplateId:
										draft.providerTemplateId === item.id
											? undefined
											: item.id,
									paidAmountNote: item.hint,
								})
							}
							contentStyle={[
								styles.templateChip,
								{
									backgroundColor:
										draft.providerTemplateId === item.id
											? palette.primary
											: "transparent",
									borderColor:
										draft.providerTemplateId === item.id
											? palette.primary
											: palette.border,
								},
							]}
						>
							<Text
								style={[
									styles.templateLabel,
									{
										color:
											draft.providerTemplateId === item.id
												? palette.onPrimary
												: palette.text,
									},
								]}
							>
								{item.provider} template
							</Text>
						</PressableScale>
					))}

					{template ? (
						<View
							style={[
								styles.templateDetail,
								{ backgroundColor: palette.surface, borderColor: palette.border },
							]}
						>
							<Text style={[styles.templateHint, { color: palette.body }]}>
								{template.hint}
							</Text>
							<Text style={[styles.hint, { color: palette.warning }]}>
								{template.disclaimer}
							</Text>
						</View>
					) : null}

					<TextField
						label="Manual extended date"
						value={draft.extendedDate}
						onChangeText={(value) => update({ extendedDate: value })}
						placeholder="2026-05-28"
						hint="YYYY-MM-DD format. Creates reminders 1 day before and on the date."
					/>
					<TextField
						label="Paid amount or support note"
						value={draft.paidAmountNote}
						onChangeText={(value) => update({ paidAmountNote: value })}
						placeholder="Note about minimum payment or support guidance"
						multiline
						minHeight={72}
					/>
				</View>
			) : null}

			{error ? (
				<Text style={[styles.error, { color: palette.danger }]}>{error}</Text>
			) : null}

			<View style={styles.actions}>
				<Button
					title={isSaving ? "Saving..." : submitLabel}
					variant="primary"
					onPress={() => void handleSubmit()}
					disabled={isSaving}
					style={{ flex: 1 }}
				/>
				{onDelete ? (
					<Button
						title="Delete card"
						variant="danger"
						onPress={() => void onDelete()}
					/>
				) : null}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.lg,
		gap: spacing.md,
		paddingBottom: 120,
	},
	headerSection: {
		gap: spacing.xxs,
		marginBottom: spacing.xs,
	},
	formTitle: {
		...typeTokens.displayMd,
	},
	formSubtitle: {
		...typeTokens.body,
	},
	section: {
		...shadow.soft,
		borderWidth: hairline,
		borderRadius: radius.xl,
		backgroundColor: stylepass.panel,
		padding: spacing.md,
		gap: spacing.sm,
	},
	sectionTitle: {
		...typeTokens.titleSm,
	},
	hint: {
		...typeTokens.legal,
	},
	advancedToggle: {
		...shadow.soft,
		minHeight: 50,
		borderWidth: hairline,
		borderRadius: radius.lg,
		backgroundColor: "rgba(255, 255, 255, 0.36)",
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		justifyContent: "center",
	},
	advancedTitle: {
		...typeTokens.titleSm,
	},
	advancedMeta: {
		...typeTokens.legal,
		marginTop: 2,
	},
	toggle: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: hairline,
		borderRadius: radius.md,
		backgroundColor: "rgba(255, 255, 255, 0.36)",
		paddingHorizontal: spacing.md,
		paddingVertical: 14,
	},
	toggleLabel: {
		...typeTokens.body,
	},
	toggleDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	warningSection: {
		...shadow.soft,
		borderWidth: hairline,
		borderRadius: radius.xl,
		padding: spacing.md,
		gap: spacing.sm,
	},
	warningTitle: {
		...typeTokens.titleSm,
	},
	warningBody: {
		...typeTokens.body,
	},
	warningActions: {
		flexDirection: "row",
		gap: spacing.xs,
	},
	templateChip: {
		borderWidth: hairline,
		borderRadius: radius.lg,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		paddingHorizontal: spacing.md,
		paddingVertical: 12,
		alignItems: "center",
	},
	templateLabel: {
		...typeTokens.caption,
	},
	templateDetail: {
		borderWidth: hairline,
		borderRadius: radius.md,
		padding: spacing.sm,
		gap: 6,
	},
	templateHint: {
		...typeTokens.body,
	},
	actions: {
		flexDirection: "row",
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	error: {
		...typeTokens.body,
		textAlign: "center",
	},
});

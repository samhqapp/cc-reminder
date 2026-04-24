import type { Card, DerivedReminder, ReminderStageKind } from "@/types/domain";

import {
	addDays,
	formatDateKey,
	formatFullDate,
	formatShortDate,
	getNextOccurrence,
	getPreviousOccurrence,
	getPreviousOccurrenceFromReference,
	relativeDayLabel,
	startOfDay,
} from "@/utils/date";

function buildReminder(
	card: Card,
	options: {
		cycleId: string;
		stage: ReminderStageKind;
		scheduledFor: Date;
		dueDate: Date;
		title: string;
		subtitle: string;
		tone: DerivedReminder["tone"];
	},
) {
	const reminderId = `${options.cycleId}:${options.stage}:${formatDateKey(options.scheduledFor)}`;
	const reminderState = card.reminderState[reminderId];
	const paymentState = card.paymentState[options.cycleId];

	return {
		id: reminderId,
		cycleId: options.cycleId,
		cardId: card.id,
		cardName: card.name,
		provider: card.provider,
		companyKey: card.companyKey,
		groupName: card.groupName,
		intent: card.intent ?? "continue",
		note: card.note,
		stage: options.stage,
		title: options.title,
		subtitle: options.subtitle,
		scheduledFor: options.scheduledFor.toISOString(),
		dueDate: options.dueDate.toISOString(),
		tone: options.tone,
		isAcknowledged: Boolean(reminderState?.acknowledgedAt),
		isSettled: Boolean(paymentState?.settledAt),
		snoozedUntil: reminderState?.snoozedUntil,
	} satisfies DerivedReminder;
}

function isValidDate(value: Date) {
	return !Number.isNaN(value.getTime());
}

export function deriveReminders(cards: Card[], now = new Date()) {
	const today = startOfDay(now);
	const reminders: DerivedReminder[] = [];

	for (const card of cards) {
		const intentLabel = card.intent === "cancel" ? "Cancel" : "Continue";
		const nextDue = getNextOccurrence(card.dueDay, today);
		const previousDue = getPreviousOccurrence(card.dueDay, today);
		const activeDueCycle = previousDue <= today ? previousDue : nextDue;
		const nextCycleId = `${card.id}:${formatDateKey(nextDue)}`;
		const activeCycleId = `${card.id}:${formatDateKey(activeDueCycle)}`;

		if (card.billingDay) {
			const billingDate = getPreviousOccurrenceFromReference(
				card.billingDay,
				nextDue,
			);
			reminders.push(
				buildReminder(card, {
					cycleId: nextCycleId,
					stage: "billing",
					scheduledFor: billingDate,
					dueDate: nextDue,
					title: `${intentLabel} prep for ${card.name}`,
					subtitle: `${formatShortDate(billingDate)} · ${relativeDayLabel(billingDate, today)}`,
					tone: "neutral",
				}),
			);
		}

		for (const offset of [7, 3, 1]) {
			const stageDate = addDays(nextDue, -offset);
			reminders.push(
				buildReminder(card, {
					cycleId: nextCycleId,
					stage: `due-soon-${offset}` as ReminderStageKind,
					scheduledFor: stageDate,
					dueDate: nextDue,
					title: `${intentLabel} ${card.name} in ${offset} day${offset === 1 ? "" : "s"}`,
					subtitle: `${card.provider} · Renewal ${formatFullDate(nextDue)}`,
					tone:
						card.intent === "cancel"
							? "warning"
							: offset === 1
								? "warning"
								: "accent",
				}),
			);
		}

		reminders.push(
			buildReminder(card, {
				cycleId: nextCycleId,
				stage: "due-today",
				scheduledFor: nextDue,
				dueDate: nextDue,
				title: `${intentLabel} ${card.name} today`,
				subtitle: `${card.provider} · Renewal ${formatFullDate(nextDue)}`,
				tone: card.intent === "cancel" ? "danger" : "warning",
			}),
		);

		if (previousDue < today) {
			reminders.push(
				buildReminder(card, {
					cycleId: activeCycleId,
					stage: "overdue",
					scheduledFor: today,
					dueDate: previousDue,
					title: `${card.name} still needs a decision`,
					subtitle: `${intentLabel} target ${formatFullDate(previousDue)} · repeats daily until handled`,
					tone: "danger",
				}),
			);
		}

		if (card.extendedTracking?.manualDate) {
			const extendedDate = startOfDay(
				new Date(card.extendedTracking.manualDate),
			);
			if (isValidDate(extendedDate)) {
				const extendedCycleId = activeCycleId;
				const dayBeforeExtended = addDays(extendedDate, -1);

				if (dayBeforeExtended >= today) {
					reminders.push(
						buildReminder(card, {
							cycleId: extendedCycleId,
							stage: "extended",
							scheduledFor: dayBeforeExtended,
							dueDate: extendedDate,
							title: `${intentLabel} ${card.name} tomorrow`,
							subtitle: `${card.provider} · Manual date ${formatFullDate(extendedDate)}`,
							tone: "warning",
						}),
					);
				}

				if (extendedDate >= today) {
					reminders.push(
						buildReminder(card, {
							cycleId: extendedCycleId,
							stage: "extended",
							scheduledFor: extendedDate,
							dueDate: extendedDate,
							title: `${intentLabel} ${card.name} follow-up`,
							subtitle: `${card.provider} · Manual date ${formatFullDate(extendedDate)}`,
							tone: "success",
						}),
					);
				} else {
					reminders.push(
						buildReminder(card, {
							cycleId: extendedCycleId,
							stage: "extended",
							scheduledFor: today,
							dueDate: extendedDate,
							title: `${card.name} follow-up passed`,
							subtitle: `Manual date ${formatFullDate(extendedDate)} · settle when handled`,
							tone: "danger",
						}),
					);
				}
			}
		}
	}

	return reminders
		.filter((reminder) => {
			if (reminder.isSettled && reminder.stage !== "billing") {
				return false;
			}
			if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) {
				return false;
			}
			if (reminder.stage === "overdue" || reminder.stage === "extended") {
				return true;
			}

			return new Date(reminder.scheduledFor) >= addDays(today, -2);
		})
		.sort(
			(left, right) =>
				new Date(left.scheduledFor).getTime() -
				new Date(right.scheduledFor).getTime(),
		);
}

export function getReminderMetrics(
	cards: Card[],
	reminders: DerivedReminder[],
) {
	return {
		cardCount: cards.length,
		activeCount: reminders.length,
		overdueCount: reminders.filter((item) => item.stage === "overdue").length,
		extendedCount: reminders.filter((item) => item.stage === "extended").length,
	};
}

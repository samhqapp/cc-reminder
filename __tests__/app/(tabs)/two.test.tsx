import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import RemindersScreen from "@/app/(tabs)/two";
import type { DerivedReminder } from "@/types/domain";

const mockUseCards = jest.fn();
const mockDeriveReminders = jest.fn();
const mockGetReminderMetrics = jest.fn();

jest.mock("@/hooks/useCards", () => ({
	useCards: () => mockUseCards(),
}));

jest.mock("@/utils/reminders", () => ({
	deriveReminders: (...args: unknown[]) => mockDeriveReminders(...args),
	getReminderMetrics: (...args: unknown[]) => mockGetReminderMetrics(...args),
}));

describe("RemindersScreen", () => {
	it("renders the reminder grid and wires reminder actions", async () => {
		const mockAcknowledgeReminder = jest.fn(async () => undefined);
		const mockSnoozeReminder = jest.fn(async () => undefined);
		const mockSettleCycle = jest.fn(async () => undefined);
		const reminder: DerivedReminder = {
			id: "reminder-1",
			cycleId: "cycle-1",
			cardId: "card-1",
			cardName: "Spotify Premium",
			provider: "Spotify",
			companyKey: "spotify",
			groupName: "Streaming",
			intent: "cancel",
			note: "Cancel two days before renewal.",
			stage: "overdue",
			title: "Spotify Premium still needs a decision",
			subtitle: "Cancel target Apr 15, 2026 · repeats daily until handled",
			scheduledFor: "2026-04-20T00:00:00.000Z",
			dueDate: "2026-04-15T00:00:00.000Z",
			tone: "danger",
			isAcknowledged: false,
			isSettled: false,
		};

		mockUseCards.mockReturnValue({
			cards: [
				{
					id: "card-1",
					name: "Spotify Premium",
					provider: "Spotify",
					intent: "cancel",
					note: "Cancel two days before renewal.",
				},
			],
			acknowledgeReminder: mockAcknowledgeReminder,
			settleCycle: mockSettleCycle,
			snoozeReminder: mockSnoozeReminder,
		});
		mockDeriveReminders.mockReturnValue([reminder]);
		mockGetReminderMetrics.mockReturnValue({ cardCount: 1, activeCount: 1, overdueCount: 1 });

		render(<RemindersScreen />);

		expect(screen.getByText("Reminders")).toBeOnTheScreen();
		expect(screen.getByText("Renewal Window")).toBeOnTheScreen();
		expect(screen.getByText("Due Tonight")).toBeOnTheScreen();
		fireEvent.press(screen.getByLabelText("Hide reminder summary"));
		expect(screen.queryByText("Due Tonight")).toBeNull();
		fireEvent.press(screen.getByText("Seen"));
		fireEvent.press(screen.getByText("Snooze"));
		fireEvent.press(screen.getByText("Settled"));

		await waitFor(() => expect(mockAcknowledgeReminder).toHaveBeenCalledWith("card-1", "reminder-1"));
		expect(mockSnoozeReminder).toHaveBeenCalledWith("card-1", "reminder-1", 12);
		expect(mockSettleCycle).toHaveBeenCalledWith("card-1", "cycle-1");
	});

	it("shows the empty state when there are no reminders", () => {
		mockUseCards.mockReturnValue({
			cards: [],
			acknowledgeReminder: jest.fn(),
			settleCycle: jest.fn(),
			snoozeReminder: jest.fn(),
		});
		mockDeriveReminders.mockReturnValue([]);
		mockGetReminderMetrics.mockReturnValue({ cardCount: 0, activeCount: 0, overdueCount: 0 });

		render(<RemindersScreen />);
		expect(screen.getByText("Renewal Window")).toBeOnTheScreen();
		expect(screen.getByText("Nothing due")).toBeOnTheScreen();
	});
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import CardsScreen from "@/app/(tabs)/index";
import { makeCard, makeDraft } from "@/test/factories";

const mockUseCards = jest.fn();

jest.mock("@/hooks/useCards", () => ({
	useCards: () => mockUseCards(),
}));

jest.mock("@/utils/reminders", () => ({
	deriveReminders: jest.fn(() => []),
}));

describe("CardsScreen", () => {
	it("shows cards and opens the add-card bottom sheet", async () => {
		const mockCreateCard = jest.fn(async () => null);
		mockUseCards.mockReturnValue({
			cards: [
				makeCard(),
				makeCard({
					id: "card-2",
					name: "Netflix Family",
					provider: "Netflix",
					groupName: "Streaming",
				}),
				makeCard({
					id: "card-3",
					name: "Figma Pro",
					provider: "Figma",
					groupName: "Work",
				}),
			],
			createCard: mockCreateCard,
			defaultDraft: () =>
				makeDraft({
					name: "",
					provider: "",
					last4: "",
					dueDay: "",
					groupName: "",
					note: "",
				}),
			tagPool: [],
		});

		render(<CardsScreen />);

		expect(screen.getByText("Billing Dates")).toBeOnTheScreen();
		expect(screen.getByText("Next Up")).toBeOnTheScreen();
		expect(screen.getByText("Netflix Family")).toBeOnTheScreen();
		expect(screen.getByText("Figma Pro")).toBeOnTheScreen();

		fireEvent.press(screen.getByLabelText("Add renewal"));

		expect(
			screen.getByText("Quick setup for renewal dates."),
		).toBeOnTheScreen();

		fireEvent.changeText(screen.getByPlaceholderText("Netflix"), "Spotify");
		fireEvent.changeText(screen.getByPlaceholderText("25"), "17");
		fireEvent.press(screen.getByText("Save card"));

		await waitFor(() =>
			expect(mockCreateCard).toHaveBeenCalledWith(
				expect.objectContaining({
					provider: "Spotify",
					name: "",
					last4: "",
					dueDay: "17",
				}),
			),
		);
	});

	it("shows an empty state when there are no cards", () => {
		mockUseCards.mockReturnValue({
			cards: [],
			createCard: jest.fn(async () => null),
			defaultDraft: () => makeDraft({ name: "", provider: "", last4: "", dueDay: "" }),
			tagPool: [],
		});

		render(<CardsScreen />);
		expect(screen.getByText("Billing Dates")).toBeOnTheScreen();
		expect(screen.getByText("No cards yet")).toBeOnTheScreen();
	});
});

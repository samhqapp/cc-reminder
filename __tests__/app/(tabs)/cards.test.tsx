import { fireEvent, render, screen } from "@testing-library/react-native";

import CardsManagerScreen from "@/app/(tabs)/cards";
import { makeCard, makeDraft } from "@/test/factories";

const mockUseCards = jest.fn();

jest.mock("@expo/vector-icons/Ionicons", () => {
	const React = require("react");
	const { Text } = require("react-native");

	function MockIcon({ name }: { name?: string }) {
		return React.createElement(Text, null, name ?? "icon");
	}

	MockIcon.glyphMap = {};

	return MockIcon;
});

jest.mock("@/hooks/useCards", () => ({
	useCards: () => mockUseCards(),
}));

describe("CardsManagerScreen", () => {
	it("shows stacked managed cards and opens the add-card sheet", () => {
		mockUseCards.mockReturnValue({
			cards: [
				makeCard({
					id: "card-1",
					name: "Family Ledger",
					provider: "Visa",
					last4: "1111",
				}),
				makeCard({
					id: "card-2",
					name: "Travel Backup",
					provider: "Mastercard",
					last4: "2222",
				}),
			],
			createCard: jest.fn(async () => null),
			defaultDraft: () => makeDraft({ name: "", provider: "", last4: "", dueDay: "" }),
			tagPool: [],
		});

		render(<CardsManagerScreen />);

		expect(screen.getByText("Cards")).toBeOnTheScreen();
		expect(screen.getByText("Manage Renewal Cards")).toBeOnTheScreen();
		fireEvent.press(screen.getByLabelText("Hide card info"));
		expect(screen.queryByText("Manage Renewal Cards")).toBeNull();
		expect(screen.getByText("Family Ledger")).toBeOnTheScreen();
		expect(screen.getByText("Travel Backup")).toBeOnTheScreen();
		expect(screen.getAllByText("Manage")).toHaveLength(2);

		fireEvent.press(screen.getByLabelText("Add renewal"));

		expect(screen.getByText("Quick setup for renewal dates.")).toBeOnTheScreen();
	});
});

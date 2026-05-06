import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import NotesScreen from "@/app/(tabs)/notes";

const mockAddNote = jest.fn(async () => true);
const mockDeleteNote = jest.fn(async () => undefined);
const mockUseQuickNotes = jest.fn();
const mockUseCards = jest.fn();

jest.mock("@/hooks/useQuickNotes", () => ({
	useQuickNotes: () => mockUseQuickNotes(),
}));

jest.mock("@/hooks/useCards", () => ({
	useCards: () => mockUseCards(),
}));

describe("NotesScreen", () => {
	it("saves and deletes notes", async () => {
		mockUseCards.mockReturnValue({
			cards: [
				{
					id: "card-1",
					name: "Netflix Family",
					provider: "Netflix",
					intent: "cancel",
					note: "Cancel before the 12th.",
				},
			],
		});
		mockUseQuickNotes.mockReturnValue({
			notes: [
				{ id: "1", body: "Call support", createdAt: "2026-04-20T09:00:00.000Z" },
			],
			isReady: true,
			addNote: mockAddNote,
			deleteNote: mockDeleteNote,
			updateNote: jest.fn(async () => undefined),
		});

		render(<NotesScreen />);

		expect(screen.getByText("Netflix Family")).toBeOnTheScreen();
		fireEvent.changeText(screen.getByPlaceholderText("Jot something down..."), "Track statement");
		fireEvent.press(screen.getByText("Save note"));

		await waitFor(() => expect(mockAddNote).toHaveBeenCalledWith("Track statement"));

		fireEvent.press(screen.getByText("Delete"));
		await waitFor(() => expect(mockDeleteNote).toHaveBeenCalledWith("1"));
	});

	it("shows loading and empty states", () => {
		mockUseCards.mockReturnValue({
			cards: [],
		});
		mockUseQuickNotes.mockReturnValue({
			notes: [],
			isReady: false,
			addNote: mockAddNote,
			deleteNote: mockDeleteNote,
			updateNote: jest.fn(async () => undefined),
		});

		const { rerender } = render(<NotesScreen />);
		expect(screen.getByText("Loading...")).toBeOnTheScreen();

		mockUseQuickNotes.mockReturnValue({
			notes: [],
			isReady: true,
			addNote: mockAddNote,
			deleteNote: mockDeleteNote,
			updateNote: jest.fn(async () => undefined),
		});

		rerender(<NotesScreen />);
		expect(screen.getByText("No notes yet")).toBeOnTheScreen();
	});
});

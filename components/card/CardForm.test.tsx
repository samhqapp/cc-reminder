import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { CardForm } from "@/components/card/CardForm";
import { makeDraft } from "@/test/factories";

describe("CardForm", () => {
	it("submits sanitized card values", async () => {
		const onSubmit = jest.fn(async () => null);

		render(
			<CardForm
				title="Create a card"
				subtitle="Capture card reminder data"
				initialDraft={makeDraft()}
				submitLabel="Save card"
				onSubmit={onSubmit}
			/>,
		);

		expect(screen.queryByPlaceholderText("Example: Everyday Gold")).toBeNull();
		fireEvent.changeText(screen.getByPlaceholderText("Example: Netflix"), "Amex");
		fireEvent.changeText(screen.getByPlaceholderText("25"), "31");
		fireEvent.press(screen.getByText("Advanced"));
		fireEvent.changeText(screen.getByPlaceholderText("Example: Everyday Gold"), "Blue Cash");
		fireEvent.changeText(screen.getByPlaceholderText("0123"), "12a34");
		fireEvent.changeText(screen.getByPlaceholderText("1-31"), "33");
		fireEvent.changeText(screen.getByPlaceholderText("travel, backup"), "travel, backup");

		fireEvent.press(screen.getByText("Save card"));

		await waitFor(() => expect(onSubmit).toHaveBeenCalled());
		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "Blue Cash",
				provider: "Amex",
				last4: "1234",
				billingDay: "33",
				dueDay: "31",
				tags: "travel, backup",
			}),
		);
	});

	it("reveals extended tracking fields after warning acceptance and applies the provider template", () => {
		render(
			<CardForm
				title="Create a card"
				subtitle="Capture card reminder data"
				initialDraft={makeDraft()}
				submitLabel="Save card"
				onSubmit={jest.fn(async () => null)}
			/>,
		);

		expect(screen.queryByText("Extended tracking")).toBeNull();
		fireEvent.press(screen.getByText("Advanced"));
		fireEvent.press(screen.getByText("Extended tracking"));

		expect(screen.getByText("Extended tracking acknowledgment")).toBeOnTheScreen();
		fireEvent.press(screen.getByText("I understand, enable it"));

		expect(screen.getByText("Provider template (advisory only)")).toBeOnTheScreen();

		fireEvent.press(screen.getByText("American Express template"));

		expect(
			screen.getByText(/Use this only as a memory aid/),
		).toBeOnTheScreen();
	});

	it("renders submit errors and delete affordance", async () => {
		const onDelete = jest.fn(async () => undefined);

		render(
			<CardForm
				title="Edit card"
				subtitle="Update card details"
				initialDraft={makeDraft()}
				submitLabel="Save changes"
				onSubmit={jest.fn(async () => "Due day is required.")}
				onDelete={onDelete}
			/>,
		);

		fireEvent.press(screen.getByText("Save changes"));
		await screen.findByText("Due day is required.");

		fireEvent.press(screen.getByText("Delete card"));
		await waitFor(() => expect(onDelete).toHaveBeenCalled());
	});
});

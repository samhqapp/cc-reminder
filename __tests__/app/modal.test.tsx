import { render, screen } from "@testing-library/react-native";

import ModalScreen from "@/app/modal";

describe("ModalScreen", () => {
	it("renders the trust and product explanation sections", () => {
		render(<ModalScreen />);

		expect(screen.getByText("About CC Reminder")).toBeOnTheScreen();
		expect(screen.getByText("Trust boundary")).toBeOnTheScreen();
		expect(screen.getByText("What it never stores")).toBeOnTheScreen();
		expect(screen.getByText("Provider templates")).toBeOnTheScreen();
		expect(screen.getByText("Reminder model")).toBeOnTheScreen();
	});
});
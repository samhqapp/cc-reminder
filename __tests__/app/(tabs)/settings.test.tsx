import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import SettingsScreen from "@/app/(tabs)/settings";

const mockResetOnboarding = jest.fn(async () => undefined);

jest.mock("@/hooks/useOnboarding", () => ({
	useOnboarding: () => ({
		resetOnboarding: mockResetOnboarding,
	}),
}));

describe("SettingsScreen", () => {
	it("shows onboarding from settings", async () => {
		const { router } = jest.requireMock("expo-router");

		render(<SettingsScreen />);

		expect(screen.getByText("Quiet Controls")).toBeOnTheScreen();
		expect(screen.getByText("Replay The Illustrated Flow")).toBeOnTheScreen();
		fireEvent.press(screen.getByText("Show onboarding"));

		await waitFor(() => expect(mockResetOnboarding).toHaveBeenCalled());
		expect(router.replace).toHaveBeenCalledWith("/onboarding");
	});
});

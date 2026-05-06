import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import OnboardingScreen from "@/app/onboarding";

const mockCompleteOnboarding = jest.fn(async () => undefined);
const mockRequestNotificationPermission = jest.fn(async () => undefined);

jest.mock("@/hooks/useOnboarding", () => ({
	useOnboarding: () => ({
		completeOnboarding: mockCompleteOnboarding,
	}),
}));

jest.mock("@/utils/notifications", () => ({
	requestNotificationPermission: () => mockRequestNotificationPermission(),
}));

describe("OnboardingScreen", () => {
	it("walks through steps, shows trust copy, and finishes into the app", async () => {
		render(<OnboardingScreen />);
		const { router } = jest.requireMock("expo-router");

		expect(screen.getByText("Your cards")).toBeOnTheScreen();
		expect(screen.getByText(/Track every/)).toBeOnTheScreen();

		fireEvent.press(screen.getByText("Continue"));
		expect(screen.getByText("Reminders")).toBeOnTheScreen();

		fireEvent.press(screen.getByText("Continue"));
		expect(screen.getByText("Your data stays on your device")).toBeOnTheScreen();

		fireEvent.press(screen.getByText("Get Started"));

		await waitFor(() => expect(mockRequestNotificationPermission).toHaveBeenCalled());
		await waitFor(() => expect(mockCompleteOnboarding).toHaveBeenCalled());
		await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(tabs)"));
	});
});

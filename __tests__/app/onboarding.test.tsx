import {
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react-native";
import { Image } from "react-native";

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
	it("renders onboarding art without platform image fade transitions", () => {
		const { UNSAFE_getAllByType } = render(<OnboardingScreen />);

		expect(
			UNSAFE_getAllByType(Image).every(
				(image) => image.props.fadeDuration === 0,
			),
		).toBe(true);
	});

	it("walks through the illustrated steps and finishes into the app", async () => {
		render(<OnboardingScreen />);
		const { router } = jest.requireMock("expo-router");

		expect(screen.getByText("Billing dates")).toBeOnTheScreen();
		expect(screen.getByText("Credit Card Dates Made Easy")).toBeOnTheScreen();
		expect(screen.queryByText("Step 1")).toBeNull();

		fireEvent.press(screen.getByLabelText("Continue onboarding"));
		expect(screen.getByText("Reminder timing")).toBeOnTheScreen();
		expect(screen.getByText("Get Nudged Around Renewal Day")).toBeOnTheScreen();
		await waitFor(() => expect(screen.queryByText("Billing dates")).toBeNull());

		fireEvent.press(screen.getByLabelText("Continue onboarding"));
		expect(screen.getByText("Renewal notes")).toBeOnTheScreen();
		expect(screen.getByText("Keep Renewal Notes Close")).toBeOnTheScreen();
		await waitFor(() => expect(screen.queryByText("Reminder timing")).toBeNull());

		fireEvent.press(screen.getByLabelText("Finish onboarding"));

		await waitFor(() => expect(mockRequestNotificationPermission).toHaveBeenCalled());
		await waitFor(() => expect(mockCompleteOnboarding).toHaveBeenCalled());
		await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(tabs)"));
	});
});

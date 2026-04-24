import { render, waitFor } from "@testing-library/react-native";

import AppIndex from "@/app/index";

const mockUseOnboarding = jest.fn();

jest.mock("@/hooks/useOnboarding", () => ({
	useOnboarding: () => mockUseOnboarding(),
}));

describe("AppIndex", () => {
	it("routes first-time users into onboarding", async () => {
		const { router } = jest.requireMock("expo-router");
		mockUseOnboarding.mockReturnValue({ hasCompletedOnboarding: false });

		render(<AppIndex />);

		await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/onboarding"));
	});

	it("routes completed users into tabs", async () => {
		const { router } = jest.requireMock("expo-router");
		mockUseOnboarding.mockReturnValue({ hasCompletedOnboarding: true });

		render(<AppIndex />);

		await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(tabs)"));
	});
});

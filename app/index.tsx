import { router } from "expo-router";
import { useEffect } from "react";

import { useOnboarding } from "@/hooks/useOnboarding";

export default function AppIndex() {
	const { hasCompletedOnboarding } = useOnboarding();

	useEffect(() => {
		router.replace(hasCompletedOnboarding ? "/(tabs)" : "/onboarding");
	}, [hasCompletedOnboarding]);

	return null;
}

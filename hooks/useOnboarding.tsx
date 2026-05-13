import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { storageKeys } from "@/utils/storage";

const ALWAYS_SHOW_ONBOARDING = true;

type OnboardingContextValue = {
	hasCompletedOnboarding: boolean;
	isReady: boolean;
	completeOnboarding: () => Promise<void>;
	resetOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function hydrate() {
			if (ALWAYS_SHOW_ONBOARDING) {
				if (isMounted) {
					setHasCompletedOnboarding(false);
					setIsReady(true);
				}
				return;
			}

			const value = await AsyncStorage.getItem(storageKeys.onboardingComplete);

			if (!isMounted) {
				return;
			}

			setHasCompletedOnboarding(value === "true");
			setIsReady(true);
		}

		hydrate();

		return () => {
			isMounted = false;
		};
	}, []);

	async function completeOnboarding() {
		await AsyncStorage.setItem(storageKeys.onboardingComplete, "true");
		setHasCompletedOnboarding(true);
	}

	async function resetOnboarding() {
		await AsyncStorage.removeItem(storageKeys.onboardingComplete);
		setHasCompletedOnboarding(false);
	}

	return (
		<OnboardingContext.Provider
			value={{
				hasCompletedOnboarding,
				isReady,
				completeOnboarding,
				resetOnboarding,
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
}

export function useOnboarding() {
	const value = useContext(OnboardingContext);

	if (!value) {
		throw new Error("useOnboarding must be used inside OnboardingProvider");
	}

	return value;
}

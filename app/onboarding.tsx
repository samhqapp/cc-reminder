import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
	Image,
	type ImageSourcePropType,
	PanResponder,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, {
	cancelAnimation,
	Easing,
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/ui/PressableScale";
import { font, radius, spacing, type as typeTokens } from "@/constants/Tokens";
import { useOnboarding } from "@/hooks/useOnboarding";
import { requestNotificationPermission } from "@/utils/notifications";

const SLIDE_ANIMATION_MS = 360;
const SLIDE_EASING = Easing.bezier(0.22, 1, 0.36, 1);
const ACTION_BUTTON_SIZE = 64;
const SIDE_DRIFT_ENTER_DISTANCE = 76;
const SIDE_DRIFT_EXIT_DISTANCE = 62;
const DRAG_INPUT_RANGE = [-160, 0, 160];
const DRAG_OUTPUT_RANGE = [-34, 0, 34];

type Step = {
	id: string;
	kicker: string;
	title: string;
	body: string;
	image: ImageSourcePropType;
	surface: string;
	actionColor: string;
	actionIcon: string;
	art: {
		heightRatio: number;
		maxHeight: number;
		minHeight: number;
		bottomRatio: number;
		maxBottom: number;
		widthRatio: number;
		leftRatio: number;
	};
};

const STEPS: Step[] = [
	{
		id: "billing-dates",
		kicker: "Billing dates",
		title: "Credit Card Dates Made Easy",
		body: "Add each subscription's billing day once, then check the next renewal date whenever you need it.",
		image: require("../assets/images/onboarding/track-renewals.png"),
		surface: "#d2bef0",
		actionColor: "rgba(70, 58, 92, 0.86)",
		actionIcon: "#f8efff",
		art: {
			heightRatio: 0.54,
			maxHeight: 560,
			minHeight: 400,
			bottomRatio: 0.18,
			maxBottom: 170,
			widthRatio: 1.04,
			leftRatio: -0.02,
		},
	},
	{
		id: "reminder-timing",
		kicker: "Reminder timing",
		title: "Get Nudged Around Renewal Day",
		body: "Set simple reminders so the billing date stays visible before the next cycle comes around.",
		image: require("../assets/images/onboarding/renewal-reminders.png"),
		surface: "#f3b9a7",
		actionColor: "rgba(42, 76, 66, 0.86)",
		actionIcon: "#fff4ef",
		art: {
			heightRatio: 0.68,
			maxHeight: 700,
			minHeight: 480,
			bottomRatio: 0.24,
			maxBottom: 220,
			widthRatio: 1.32,
			leftRatio: -0.16,
		},
	},
	{
		id: "renewal-notes",
		kicker: "Renewal notes",
		title: "Keep Renewal Notes Close",
		body: "Save cancellation links, support numbers, and plan details locally with the card.",
		image: require("../assets/images/onboarding/private-notes.png"),
		surface: "#d2bf78",
		actionColor: "rgba(50, 81, 64, 0.86)",
		actionIcon: "#fff9df",
		art: {
			heightRatio: 0.68,
			maxHeight: 700,
			minHeight: 480,
			bottomRatio: 0.24,
			maxBottom: 220,
			widthRatio: 1.32,
			leftRatio: -0.16,
		},
	},
];

export default function OnboardingScreen() {
	const { completeOnboarding } = useOnboarding();
	const { height, width } = useWindowDimensions();
	const [step, setStep] = useState(0);
	const [direction, setDirection] = useState(1);
	const [previousStep, setPreviousStep] = useState<number | null>(null);
	const [isContinuing, setIsContinuing] = useState(false);
	const transitionInFlight = useRef(false);
	const slideProgress = useSharedValue(1);
	const dragX = useSharedValue(0);

	const isLast = step === STEPS.length - 1;
	const current = STEPS[step];
	const horizontalPadding = width < 380 ? spacing.md : spacing.lg;

	const clearTransition = useCallback(() => {
		transitionInFlight.current = false;
		setPreviousStep(null);
	}, []);

	const resetDrag = useCallback(() => {
		dragX.value = withSpring(0, {
			damping: 18,
			mass: 0.7,
			stiffness: 220,
		});
	}, [dragX]);

	const finishOnboarding = useCallback(async ({
		requestPermission,
	}: {
		requestPermission: boolean;
	}) => {
		if (isContinuing) return;

		setIsContinuing(true);

		try {
			if (requestPermission) {
				await requestNotificationPermission();
			}
			await completeOnboarding();
			router.replace("/(tabs)");
		} finally {
			setIsContinuing(false);
		}
	}, [completeOnboarding, isContinuing]);

	const startStepTransition = useCallback(
		(nextStep: number, nextDirection: 1 | -1) => {
			if (transitionInFlight.current || previousStep !== null || nextStep === step) {
				return;
			}

			transitionInFlight.current = true;
			cancelAnimation(slideProgress);
			cancelAnimation(dragX);
			dragX.value = 0;
			slideProgress.value = 0;
			setPreviousStep(step);
			setDirection(nextDirection);
			setStep(nextStep);

			slideProgress.value = withTiming(
				1,
				{
					duration: SLIDE_ANIMATION_MS,
					easing: SLIDE_EASING,
				},
				(finished) => {
					if (finished) {
						runOnJS(clearTransition)();
					}
				},
			);
		},
		[clearTransition, dragX, previousStep, slideProgress, step],
	);

	const goNext = useCallback(() => {
		if (transitionInFlight.current || previousStep !== null) return;

		if (isLast) {
			void finishOnboarding({ requestPermission: true });
		} else {
			startStepTransition(step + 1, 1);
		}
	}, [finishOnboarding, isLast, previousStep, startStepTransition, step]);

	const goPrev = useCallback(() => {
		if (transitionInFlight.current || previousStep !== null) return;

		if (step > 0) {
			startStepTransition(step - 1, -1);
		}
	}, [previousStep, startStepTransition, step]);

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onMoveShouldSetPanResponder: (_, gesture) =>
					Math.abs(gesture.dx) > 18 &&
					Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
				onPanResponderMove: (_, gesture) => {
					dragX.value = gesture.dx;
				},
				onPanResponderRelease: (_, gesture) => {
					const shouldGoBack = gesture.dx > 54;
					const shouldGoForward = gesture.dx < -54;

					resetDrag();

					if (shouldGoBack) {
						goPrev();
					}

					if (shouldGoForward) {
						goNext();
					}
				},
				onPanResponderTerminate: resetDrag,
			}),
		[dragX, goNext, goPrev, resetDrag],
	);

	const incomingSlideStyle = useAnimatedStyle(() => {
		const dragTranslate = interpolate(
			dragX.value,
			DRAG_INPUT_RANGE,
			DRAG_OUTPUT_RANGE,
			Extrapolation.CLAMP,
		);
		const incomingTranslate = interpolate(
			slideProgress.value,
			[0, 1],
			[direction * SIDE_DRIFT_ENTER_DISTANCE, 0],
			Extrapolation.CLAMP,
		);

		return {
			opacity: previousStep === null ? 1 : slideProgress.value,
			transform: [{ translateX: incomingTranslate + dragTranslate }],
		};
	}, [direction, previousStep]);

	const outgoingSlideStyle = useAnimatedStyle(() => {
		const outgoingTranslate = interpolate(
			slideProgress.value,
			[0, 1],
			[0, -direction * SIDE_DRIFT_EXIT_DISTANCE],
			Extrapolation.CLAMP,
		);

		return {
			opacity: 1 - slideProgress.value,
			transform: [{ translateX: outgoingTranslate }],
		};
	}, [direction]);

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: current.surface }]}
			{...panResponder.panHandlers}
		>
			<View
				style={styles.contentFrame}
			>
				{previousStep !== null ? (
					<Animated.View
						pointerEvents="none"
						renderToHardwareTextureAndroid
						shouldRasterizeIOS
						style={[
							styles.slidePane,
							{ paddingHorizontal: horizontalPadding },
							outgoingSlideStyle,
						]}
					>
						<SlideContent
							item={STEPS[previousStep]}
							activeStep={previousStep}
							viewportHeight={height}
							viewportWidth={width}
						/>
					</Animated.View>
				) : null}

				<Animated.View
					renderToHardwareTextureAndroid
					shouldRasterizeIOS
					style={[
						styles.slidePane,
						{ paddingHorizontal: horizontalPadding },
						incomingSlideStyle,
					]}
				>
					<SlideContent
						item={current}
						activeStep={step}
						viewportHeight={height}
						viewportWidth={width}
					/>
				</Animated.View>
			</View>

			<View style={[styles.nextButtonWrap, { right: horizontalPadding }]}>
				<PressableScale
					accessibilityLabel={
						isLast ? "Finish onboarding" : "Continue onboarding"
					}
					onPress={goNext}
					disabled={isContinuing}
					contentStyle={[
						styles.nextButton,
						{
							backgroundColor: current.actionColor,
						},
					]}
				>
					<ChevronRightIcon color={current.actionIcon} />
				</PressableScale>
			</View>
		</SafeAreaView>
	);
}

function SlideContent({
	item,
	activeStep,
	viewportHeight,
	viewportWidth,
}: {
	item: Step;
	activeStep: number;
	viewportHeight: number;
	viewportWidth: number;
}) {
	const illustrationHeight = Math.max(
		item.art.minHeight,
		Math.min(viewportHeight * item.art.heightRatio, item.art.maxHeight),
	);
	const illustrationBottom = -Math.min(
		viewportHeight * item.art.bottomRatio,
		item.art.maxBottom,
	);
	const illustrationWidth = viewportWidth * item.art.widthRatio;
	const illustrationLeft = viewportWidth * item.art.leftRatio;

	return (
		<>
			<View style={styles.slideCopy}>
				<View style={styles.kickerBlock}>
					<Text style={styles.kicker}>{item.kicker}</Text>
					<View style={styles.dotsRow}>
						{STEPS.map((stepItem, i) => (
							<View
								key={stepItem.id}
								style={[
									styles.dot,
									{
										backgroundColor:
											i === activeStep
												? "#ffffff"
												: "rgba(24, 29, 38, 0.24)",
										width: i === activeStep ? 24 : 8,
									},
								]}
							/>
						))}
					</View>
				</View>
				<Text style={styles.title}>{item.title}</Text>
				<Text style={styles.body}>{item.body}</Text>
			</View>

			<Image
				fadeDuration={0}
				source={item.image}
				style={[
					styles.illustration,
					{
						height: illustrationHeight,
						bottom: illustrationBottom,
						left: illustrationLeft,
						width: illustrationWidth,
					},
				]}
				resizeMode="contain"
			/>
		</>
	);
}

function ChevronRightIcon({ color }: { color: string }) {
	return (
		<View style={styles.chevronBox} pointerEvents="none">
			<View
				style={[
					styles.chevronStroke,
					styles.chevronStrokeTop,
					{ backgroundColor: color },
				]}
			/>
			<View
				style={[
					styles.chevronStroke,
					styles.chevronStrokeBottom,
					{ backgroundColor: color },
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		overflow: "hidden",
	},
	contentFrame: {
		flex: 1,
		position: "relative",
		paddingBottom: 0,
		overflow: "visible",
	},
	slidePane: {
		...StyleSheet.absoluteFillObject,
		overflow: "visible",
		paddingTop: spacing.xl,
	},
	dotsRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	dot: {
		height: 8,
		borderRadius: radius.pill,
	},
	slideCopy: {
		gap: spacing.md,
		paddingTop: spacing.lg,
	},
	kickerBlock: {
		gap: spacing.sm,
	},
	illustration: {
		position: "absolute",
		left: "-16%",
		width: "132%",
	},
	kicker: {
		...typeTokens.caption,
		letterSpacing: 0.8,
		textTransform: "uppercase",
		color: "rgba(24, 29, 38, 0.68)",
	},
	title: {
		fontFamily: font.bold,
		fontSize: 48,
		lineHeight: 54,
		letterSpacing: 0,
		color: "#181d26",
		maxWidth: 342,
	},
	body: {
		fontFamily: font.medium,
		fontSize: 17,
		lineHeight: 25,
		letterSpacing: 0,
		color: "rgba(24, 29, 38, 0.78)",
		maxWidth: 430,
	},
	nextButtonWrap: {
		position: "absolute",
		bottom: 68,
		width: ACTION_BUTTON_SIZE,
		height: ACTION_BUTTON_SIZE,
	},
	nextButton: {
		width: ACTION_BUTTON_SIZE,
		height: ACTION_BUTTON_SIZE,
		borderRadius: radius.pill,
		alignItems: "center",
		justifyContent: "center",
		overflow: "hidden",
	},
	chevronBox: {
		width: 28,
		height: 28,
		alignItems: "center",
		justifyContent: "center",
		opacity: 0.76,
		transform: [{ translateX: -1 }, { translateY: -0.5 }],
	},
	chevronStroke: {
		position: "absolute",
		left: 7,
		top: 12.25,
		width: 18,
		height: 3.5,
		borderRadius: radius.pill,
	},
	chevronStrokeTop: {
		transform: [{ translateY: -5 }, { rotate: "45deg" }],
	},
	chevronStrokeBottom: {
		transform: [{ translateY: 5 }, { rotate: "-45deg" }],
	},
});

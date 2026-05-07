import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const enabled = Platform.OS !== "web";

export function lightTap() {
	if (enabled) {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}
}

export function mediumTap() {
	if (enabled) {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
	}
}

export function successTap() {
	if (enabled) {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}
}

export function warningTap() {
	if (enabled) {
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
	}
}

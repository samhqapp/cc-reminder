import Constants from "expo-constants";
import { Alert, Platform } from "react-native";

import { loadJson, saveJson, storageKeys } from "@/utils/storage";

// IndieCrumb crash reports (sent only after Send) and the opt-in daily count.
const ENDPOINT = "https://crumb.samhq.app/ic/v1";
const KEY = process.env.EXPO_PUBLIC_IC_KEY ?? "";
const MAX_AGE_S = 30 * 24 * 3600; // the server drops older reports

type Crash = ReturnType<typeof crashReport>;
type State = {
	countsOn?: boolean;
	install?: string;
	day?: string;
	month?: string;
	crash?: Crash;
};

const load = () => loadJson<State>(storageKeys.indieCrumb, {});
async function update(patch: Partial<State>) {
	await saveJson(storageKeys.indieCrumb, { ...(await load()), ...patch });
}

function device() {
	const release = String(
		Platform.OS === "android"
			? (Platform.constants as { Release?: string }).Release
			: Platform.Version,
	);
	return {
		version: Constants.expoConfig?.version ?? "0",
		build: String(
			(Platform.OS === "android"
				? Constants.expoConfig?.android?.versionCode
				: Constants.expoConfig?.ios?.buildNumber) ?? "",
		),
		os: Platform.OS === "android" ? "android" : "ios",
		os_major: parseInt(release, 10) || 0,
		// shortcut: every supported phone is arm64; read the real ABI if x86_64 Android ships.
		arch: "arm64",
	};
}

async function post(path: string, body: unknown, install?: string) {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-IC-Key": KEY,
	};
	if (install) headers["X-IC-Install"] = install;
	const response = await fetch(`${ENDPOINT}/${path}`, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});
	return response.status;
}

// The body POST /ic/v1/crash accepts. A JS error is a "panic" grouped by its top frame.
export function crashReport(error: unknown, now = Date.now()) {
	const e = error instanceof Error ? error : new Error(String(error));
	const frames = (e.stack ?? "")
		.split("\n")
		.map((row) =>
			row.match(/^\s*at (?:(\S+) )?\(?(?:address at )?(.+?):(\d+):(\d+)\)?$/),
		)
		.filter((m): m is RegExpMatchArray => m !== null)
		.slice(0, 50)
		.map(([, fn, path, line, column]) => ({
			fn: (fn ?? "anonymous").slice(0, 100),
			file: (path.split("?")[0].split(/[/\\]/).pop() ?? "").slice(0, 100),
			line: Number(line),
			column: Number(column),
		}));
	const top = frames[0];
	return {
		kind: "panic",
		message: `${e.name}: ${e.message}`.slice(0, 256),
		// Release bundles sit on one line, so the function name and column keep two crashes apart.
		file: top ? `${top.fn}@${top.file}` : "unknown",
		line: top ? (top.line === 1 ? top.column : top.line) : 0,
		time: Math.floor(now / 1000),
		...device(),
		frames: frames.map((f) => ({
			image: `${f.fn}@${f.file}:${f.line}`.replace(/[/\\]/g, "_").slice(0, 256),
			offset: `0x${f.column.toString(16)}`,
		})),
	};
}

// Saves a fatal JS error, then lets React Native's own handler end the app.
export function catchCrashes(): void {
	const previous = ErrorUtils.getGlobalHandler();
	ErrorUtils.setGlobalHandler((error, isFatal) => {
		if (!isFatal) return previous(error, isFatal);
		update({ crash: crashReport(error) })
			.catch(() => {})
			.finally(() => previous(error, isFatal));
	});
}

// Asks once about a saved crash. Either answer deletes the saved report.
export async function offerCrashReport(): Promise<void> {
	const { crash } = await load();
	if (!crash) return;
	await update({ crash: undefined });
	if (!KEY || Date.now() / 1000 - crash.time > MAX_AGE_S) return;
	await new Promise<void>((resolve) =>
		Alert.alert(
			"CC Reminder quit unexpectedly. Send a report?",
			"The report holds the error and the app version, never your cards or notes.",
			[
				{ text: "Don't Send", style: "cancel", onPress: () => resolve() },
				{
					text: "Send",
					onPress: () => {
						post("crash", crash)
							.catch(() => 0)
							.finally(resolve);
					},
				},
			],
		),
	);
}

export async function countsEnabled(): Promise<boolean> {
	return (await load()).countsOn === true;
}

export async function setCountsEnabled(on: boolean): Promise<void> {
	await update({ countsOn: on });
}

const pad = (n: number) => String(n).padStart(2, "0");

// One count per local day while the switch is on. Every failure is silent.
export async function pingDaily(now = new Date()): Promise<void> {
	try {
		const state = await load();
		if (!state.countsOn || !KEY) return;
		const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
		const day = `${month}-${pad(now.getDate())}`;
		if (state.day === day) return;
		const install =
			state.install ??
			Array.from({ length: 32 }, () =>
				Math.floor(Math.random() * 16).toString(16),
			).join("");
		const status = await post(
			"ping",
			{
				...device(),
				d: 1,
				m: state.month === month ? 0 : 1,
				uses: 1,
				pro: false,
				counters: {},
			},
			install,
		);
		// The day moves only after a 2xx, so a failed ping retries on the next launch.
		if (status >= 200 && status < 300) await update({ install, day, month });
		else if (!state.install) await update({ install });
	} catch {
		// Offline or blocked: try again on the next launch.
	}
}

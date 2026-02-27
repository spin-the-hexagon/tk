import { formatDistanceToNow } from "date-fns";
import figlet from "figlet";
import { Box, render, Text } from "ink";
import Link from "ink-link";
import Spinner from "ink-spinner";
import { atom, createStore, Provider, useAtomValue } from "jotai";
import { Suspense, use, useMemo } from "react";

import type { SchedulerTask } from "../scheduler/scheduler";

import { logs } from "../cli/logger";
import { theme } from "./colors";

export const currentTasks = atom<SchedulerTask[]>([]);
export const status = atom<"success" | ["error", any] | "pending">("pending");
const tasksToDo = atom(get => get(currentTasks).filter(it => !it.done));
const topTask = atom(get => get(currentTasks)[0]);
const taskCountText = atom(get => `${get(tasksToDo).length}/${get(currentTasks).length}`);
export const serverState = atom<ServerState | undefined>(undefined);

export interface ServerState {
	url: string;
	password: string;
}

export const store = createStore();

function ProgressModule() {
	const topTaskValue = useAtomValue(topTask);
	const currentTaskCount = useAtomValue(taskCountText);
	const currentStatus = useAtomValue(status);

	if (!topTaskValue || currentStatus === "success") {
		return (
			<Box paddingX={2} paddingY={1} backgroundColor={theme.success.color} borderBottomColor="green" gap={1}>
				<Text color={theme.background}>✓</Text>
				<Text bold>Build Completed</Text>
			</Box>
		);
	}

	if (currentStatus[0] === "error") {
		throw currentStatus[1];
	}

	return (
		<Box paddingX={2} backgroundColor={theme.background} flexGrow={1} justifyContent="space-between">
			<Box gap={1}>
				<Box flexDirection="column">
					<Text color="gray">
						<Spinner type="line2" />
					</Text>
				</Box>
				<Box flexDirection="column">
					<Text color="white" bold>
						{topTaskValue.name}
					</Text>
					<Text color="white" dimColor>
						{topTaskValue.description}
					</Text>
				</Box>
			</Box>
			<Text>{currentTaskCount}</Text>
		</Box>
	);
}

function LogsModule() {
	const currentLogs = useAtomValue(logs);
	const bar = "|";

	return (
		<Box
			flexDirection="column-reverse"
			flexGrow={1}
			height="100%"
			minHeight={0}
			paddingY={1}
			backgroundColor={theme.background}
		>
			{currentLogs.map(it => (
				<Box flexDirection="row" gap={1} key={it.id} paddingLeft={1} paddingRight={2}>
					<Box width={6} justifyContent="flex-end">
						<Text color={it.color}>{it.type}</Text>
					</Box>
					<Box
						borderRight={false}
						borderBottom={false}
						borderTop={false}
						borderStyle="single"
						height="100%"
						borderColor={theme.border}
						backgroundColor={theme.background}
					/>
					<Box flexGrow={1} flexBasis={0}>
						<Text color={theme.foreground}>{it.message}</Text>
					</Box>
					<Text color={theme.mutedForeground}>
						{formatDistanceToNow(it.timestamp, {
							includeSeconds: true,
						})}{" "}
						ago
					</Text>
				</Box>
			))}
		</Box>
	);
}

function BigText({ text }: { text: string }) {
	const rendered = useMemo(() => {
		return figlet(text, {
			font: "Future" as figlet.Fonts,
		});
	}, [text]);
	const result = use(rendered);

	return <Text color={theme.accent.color}>{result}</Text>;
}

function ServerModule({ state }: { state: ServerState }) {
	return (
		<Box backgroundColor={theme.card} paddingX={2} paddingY={1} gap={1} flexDirection="column">
			<Text bold color={theme.foreground}>
				# Server Info
			</Text>
			<Text>
				<Suspense>
					<BigText text={state.password} />
				</Suspense>
			</Text>
			<Link url={state.url}>
				<Text color="gray">
					Server running on{" "}
					<Text color="blue" italic>
						{state.url}
					</Text>
				</Text>
			</Link>
		</Box>
	);
}

function App() {
	const currentServerState = useAtomValue(serverState);

	return (
		<Box flexDirection="column" backgroundColor={theme.background}>
			<Box>
				<LogsModule />
				{currentServerState && <ServerModule state={currentServerState} />}
			</Box>
			<ProgressModule />
		</Box>
	);
}

export function startReactApp() {
	render(
		<Provider store={store}>
			<App />
		</Provider>,
	);
}

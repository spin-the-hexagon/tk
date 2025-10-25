export function getTerminalWidth() {
	return process.stdout.columns ?? 80;
}

import type { SchedulerBlock } from "./scheduler";

function sum(nums: number[]) {
	let acc = 0;

	for (const value of nums) {
		acc += value;
	}

	return acc;
}

export function printProfileReadout(block: SchedulerBlock): string {
	const categoryNames = new Set(block.tasks.map(x => x.typeId));
	const categoriesWithCounts = [...categoryNames].map(
		cat => [cat, sum(block.tasks.filter(x => x.typeId === cat).map(x => x.timeTaken))] as const,
	);

	categoriesWithCounts.sort((a, b) => a[1] - b[1]);

	categoriesWithCounts.reverse();

	return categoriesWithCounts.map(x => `${x[0].padEnd(50)}${Math.round(x[1])}ms`).join("\n");
}

import { getCurrentBlock, queue, wait } from "./scheduler/scheduler";
import { derived, value } from "./scheduler/signals";

for (let i = 0; i < 1000; i++) {
	queue({
		name: `Test ${i}`,
		async exec() {
			await wait(Math.random() * 1000);
		},
		phase: "build",
	});
}

const number = value(25);
const doubled = derived("Doubling value", async (get) => {
	const value = await get(number);
	return value * 2;
});
const halved = derived(
	"Halving value",
	async (get) => (await get(doubled)) / 2,
);

getCurrentBlock().process();

await halved.valueInternal;

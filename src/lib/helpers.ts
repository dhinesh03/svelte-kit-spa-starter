export function makeDebounce<T extends (...args: never[]) => unknown>(
	func: T,
	delay: number,
	immediate = false
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		const callNow = immediate && !timeoutId;

		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			timeoutId = null;
			if (!immediate) func(...args);
		}, delay);

		if (callNow) func(...args);
	};
}

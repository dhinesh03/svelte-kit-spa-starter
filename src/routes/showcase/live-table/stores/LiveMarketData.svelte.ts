import type { GridApi } from 'ag-grid-community';

export interface MarketTick {
	symbol: string;
	name: string;
	sector: string;
	price: number;
	change: number;
	changePercent: number;
	bid: number;
	ask: number;
	volume: number;
	high: number;
	low: number;
	open: number;
	lastUpdated: string;
}

const INSTRUMENTS: Pick<MarketTick, 'symbol' | 'name' | 'sector' | 'open'>[] = [
	{ symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', open: 189.5 },
	{ symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', open: 420.3 },
	{ symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', open: 175.8 },
	{ symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', open: 185.2 },
	{ symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', open: 880.5 },
	{ symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services', open: 505.1 },
	{ symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', open: 175.4 },
	{ symbol: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', open: 415.7 },
	{ symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', open: 198.6 },
	{ symbol: 'V', name: 'Visa Inc.', sector: 'Financials', open: 282.3 },
	{ symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', open: 155.8 },
	{ symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', open: 527.4 },
	{ symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', open: 104.2 },
	{ symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', open: 162.9 },
	{ symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financials', open: 468.5 },
	{ symbol: 'HD', name: 'Home Depot', sector: 'Consumer Discretionary', open: 365.1 },
	{ symbol: 'CVX', name: 'Chevron Corp.', sector: 'Energy', open: 155.7 },
	{ symbol: 'MRK', name: 'Merck & Co.', sector: 'Healthcare', open: 128.3 },
	{ symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', open: 170.6 },
	{ symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', open: 785.2 },
	{ symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', open: 172.4 },
	{ symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Staples', open: 60.8 },
	{ symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Staples', open: 725.3 },
	{ symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', open: 168.9 },
	{ symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', open: 628.7 }
];

function randomWalk(current: number, volatility: number): number {
	const move = (Math.random() - 0.5) * 2 * volatility;
	return Math.max(current + move, 0.01);
}

function buildTick(instrument: (typeof INSTRUMENTS)[number], price: number, high: number, low: number, volume: number): MarketTick {
	const spread = price * 0.0005;
	const change = price - instrument.open;
	return {
		symbol: instrument.symbol,
		name: instrument.name,
		sector: instrument.sector,
		price: +price.toFixed(2),
		change: +change.toFixed(2),
		changePercent: +((change / instrument.open) * 100).toFixed(2),
		bid: +(price - spread).toFixed(2),
		ask: +(price + spread).toFixed(2),
		volume,
		high: +Math.max(high, price).toFixed(2),
		low: +Math.min(low, price).toFixed(2),
		open: instrument.open,
		lastUpdated: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
	};
}

export class LiveMarketData {
	updatesPerSecond = $state(10);
	isRunning = $state(false);
	totalUpdates = $state(0);

	private _initialRows: MarketTick[] = [];
	private prices: number[] = [];
	private highs: number[] = [];
	private lows: number[] = [];
	private volumes: number[] = [];
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private gridApi: GridApi | null = null;

	constructor() {
		this.prices = INSTRUMENTS.map((i) => i.open);
		this.highs = [...this.prices];
		this.lows = [...this.prices];
		this.volumes = INSTRUMENTS.map(() => Math.floor(Math.random() * 5_000_000) + 1_000_000);
		this._initialRows = INSTRUMENTS.map((inst, i) => buildTick(inst, this.prices[i], this.highs[i], this.lows[i], this.volumes[i]));
	}

	get initialRows(): MarketTick[] {
		return this._initialRows;
	}

	setGridApi(api: GridApi) {
		this.gridApi = api;
	}

	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.scheduleUpdates();
	}

	stop() {
		this.isRunning = false;
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	setSpeed(speed: number) {
		this.updatesPerSecond = speed;
		if (this.isRunning) {
			this.stop();
			this.start();
		}
	}

	private scheduleUpdates() {
		if (this.intervalId) clearInterval(this.intervalId);
		const intervalMs = Math.max(1000 / this.updatesPerSecond, 16);
		const ticksPerInterval = Math.max(1, Math.round(this.updatesPerSecond / (1000 / intervalMs)));

		this.intervalId = setInterval(() => {
			this.applyTicks(ticksPerInterval);
		}, intervalMs);
	}

	private applyTicks(count: number) {
		const updatedTicks: MarketTick[] = [];

		for (let t = 0; t < count; t++) {
			const idx = Math.floor(Math.random() * INSTRUMENTS.length);
			const volatility = this.prices[idx] * 0.002;
			this.prices[idx] = randomWalk(this.prices[idx], volatility);
			this.volumes[idx] += Math.floor(Math.random() * 10000);
			this.highs[idx] = Math.max(this.highs[idx], this.prices[idx]);
			this.lows[idx] = Math.min(this.lows[idx], this.prices[idx]);

			const tick = buildTick(INSTRUMENTS[idx], this.prices[idx], this.highs[idx], this.lows[idx], this.volumes[idx]);
			updatedTicks.push(tick);
			this.totalUpdates++;
		}

		this.gridApi?.applyTransaction({ update: updatedTicks });
	}

	reset() {
		this.stop();
		this.prices = INSTRUMENTS.map((i) => i.open);
		this.highs = [...this.prices];
		this.lows = [...this.prices];
		this.volumes = INSTRUMENTS.map(() => Math.floor(Math.random() * 5_000_000) + 1_000_000);
		this._initialRows = INSTRUMENTS.map((inst, i) => buildTick(inst, this.prices[i], this.highs[i], this.lows[i], this.volumes[i]));
		this.totalUpdates = 0;
		this.gridApi?.setGridOption('rowData', this._initialRows);
	}

	destroy() {
		this.stop();
		this.gridApi = null;
	}
}

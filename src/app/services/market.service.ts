import { Injectable, signal } from '@angular/core';
import { MarketSnapshot, TickerItem } from '../models';

@Injectable({ providedIn: 'root' })
export class MarketService {

  readonly snapshot = signal<MarketSnapshot>({
    nifty:  { value: 22450.30, change: 164.50,  pct: 0.74 },
    sensex: { value: 73812.20, change: 601.30,  pct: 0.82 },
    usdinr: { value: 83.42,   change: -0.08,   pct: -0.10 },
    gold:   { value: 72410,   change: 215,      pct: 0.30 },
    loaded: false,
  });

  readonly tickers = signal<TickerItem[]>([
    { sym: 'NIFTY',  value: '22,450',  up: true,  pct: '+0.74%' },
    { sym: 'SENSEX', value: '73,812',  up: true,  pct: '+0.82%' },
    { sym: 'USDINR', value: '₹83.42',  up: false, pct: '-0.10%' },
    { sym: 'GOLD',   value: '₹72,410', up: true,  pct: '+0.30%' },
    { sym: 'CRUDE',  value: '$74.2',   up: false, pct: '-0.45%' },
  ]);

  /** Last successful fetch timestamp */
  readonly lastUpdated = signal<Date | null>(null);

  // Ordered proxy/strategy list — tried in sequence until one works
  private readonly PROXIES = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  ];

  private readonly BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

  constructor() {
    this.loadMarketData();
    // Refresh every 15 seconds for a live feel
    setInterval(() => this.loadMarketData(), 15_000);
  }

  private async fetchWithFallback(yahooSymbol: string): Promise<any | null> {
    const targetUrl = `${this.BASE}${yahooSymbol}?interval=1d&range=1d`;

    for (const makeProxy of this.PROXIES) {
      try {
        const proxyUrl = makeProxy(targetUrl);
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) continue;

        const raw = await res.text();
        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        // allorigins /get wraps in { contents: "..." }
        if (parsed?.contents) {
          try { parsed = JSON.parse(parsed.contents); } catch { continue; }
        }

        const meta = parsed?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) return meta;
      } catch {
        // try next proxy
      }
    }
    return null;
  }

  async loadMarketData(): Promise<void> {
    const [niftyMeta, sensexMeta] = await Promise.all([
      this.fetchWithFallback('%5ENSEI'),
      this.fetchWithFallback('%5EBSESN'),
    ]);

    const now = new Date();

    if (niftyMeta) {
      const price  = niftyMeta.regularMarketPrice;
      const prev   = niftyMeta.previousClose ?? niftyMeta.chartPreviousClose ?? price;
      const change = +(price - prev).toFixed(2);
      const pct    = +((change / prev) * 100).toFixed(2);
      const pctStr = (pct >= 0 ? '+' : '') + pct + '%';

      this.snapshot.update(s => ({ ...s, nifty: { value: price, change, pct }, loaded: true }));
      this.tickers.update(t => t.map(item =>
        item.sym === 'NIFTY'
          ? { sym: 'NIFTY', value: price.toLocaleString('en-IN', { maximumFractionDigits: 2 }), up: change >= 0, pct: pctStr }
          : item
      ));
      this.lastUpdated.set(now);
    }

    if (sensexMeta) {
      const price  = sensexMeta.regularMarketPrice;
      const prev   = sensexMeta.previousClose ?? sensexMeta.chartPreviousClose ?? price;
      const change = +(price - prev).toFixed(2);
      const pct    = +((change / prev) * 100).toFixed(2);
      const pctStr = (pct >= 0 ? '+' : '') + pct + '%';

      this.snapshot.update(s => ({ ...s, sensex: { value: price, change, pct }, loaded: true }));
      this.tickers.update(t => t.map(item =>
        item.sym === 'SENSEX'
          ? { sym: 'SENSEX', value: price.toLocaleString('en-IN', { maximumFractionDigits: 2 }), up: change >= 0, pct: pctStr }
          : item
      ));
      this.lastUpdated.set(now);
    }
  }

  getMarketContext(): string {
    const s = this.snapshot();
    const niftyDir  = s.nifty.pct  >= 0 ? 'up' : 'down';
    const sensexDir = s.sensex.pct >= 0 ? 'up' : 'down';
    return `Live market: NIFTY ${niftyDir} ${Math.abs(s.nifty.pct)}% at ${s.nifty.value.toLocaleString()}, SENSEX ${sensexDir} ${Math.abs(s.sensex.pct)}% at ${s.sensex.value.toLocaleString()}, USD/INR at ${s.usdinr.value}, Gold at ₹${s.gold.value.toLocaleString()}/10g.`;
  }
}

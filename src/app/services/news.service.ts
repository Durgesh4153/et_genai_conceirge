import { Injectable, signal } from '@angular/core';

export interface ETNewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {

  readonly headlines = signal<ETNewsItem[]>([]);
  readonly loading   = signal<boolean>(true);
  private loaded     = false;

  private readonly FALLBACK_HEADLINES: ETNewsItem[] = [
    { title: 'Sensex surges 600 pts in morning trade; Nifty above 22,400', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Markets' },
    { title: 'RBI holds repo rate at 6.5%; policy remains withdrawal of accommodation', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Economy' },
    { title: 'Budget 2025: Key highlights for individual taxpayers', link: 'https://economictimes.indiatimes.com/wealth', pubDate: '', category: 'Wealth' },
    { title: 'Gold hits all-time high of ₹72,400/10g on global cues', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Gold' },
    { title: 'Mutual fund SIP inflows cross ₹19,000 crore mark in February', link: 'https://economictimes.indiatimes.com/mf', pubDate: '', category: 'Mutual Funds' },
    { title: 'IT sector rally: Infosys, TCS gain over 3% on strong Q4 outlook', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Stocks' },
    { title: 'US Fed signals potential rate cut in second half of 2025', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Global' },
    { title: 'SEBI tightens F&O rules: New lot sizes from April 2025', link: 'https://economictimes.indiatimes.com/markets', pubDate: '', category: 'Regulation' },
  ];

  constructor() {
    this.fetchETNews();
    setInterval(() => this.fetchETNews(), 5 * 60 * 1000); // refresh every 5 min
  }

  private async fetchETNews(): Promise<void> {
    const RSS_URLS = [
      'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
      'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
    ];

    const PROXIES = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    for (const rssUrl of RSS_URLS) {
      for (const makeProxy of PROXIES) {
        try {
          const res = await fetch(makeProxy(rssUrl), {
            signal: AbortSignal.timeout(6000),
          });
          if (!res.ok) continue;

          const text = await res.text();
          const items = this.parseRSS(text);
          if (items.length > 0) {
            this.headlines.set(items.slice(0, 12));
            this.loading.set(false);
            this.loaded = true;
            return;
          }
        } catch {
          // try next proxy
        }
      }
    }

    // Fallback to curated headlines
    if (!this.loaded) {
      this.headlines.set(this.FALLBACK_HEADLINES);
      this.loading.set(false);
    }
  }

  private parseRSS(xml: string): ETNewsItem[] {
    const items: ETNewsItem[] = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const nodes = doc.querySelectorAll('item');

      nodes.forEach(node => {
        const title    = node.querySelector('title')?.textContent?.trim() ?? '';
        const link     = node.querySelector('link')?.textContent?.trim() ?? '#';
        const pubDate  = node.querySelector('pubDate')?.textContent?.trim() ?? '';
        const category = node.querySelector('category')?.textContent?.trim() ?? 'Markets';

        if (title && title.length > 10) {
          items.push({ title, link, pubDate, category });
        }
      });
    } catch {}
    return items;
  }

  getFormattedTime(pubDate: string): string {
    if (!pubDate) return 'Today';
    try {
      const d = new Date(pubDate);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch { return 'Today'; }
  }
}

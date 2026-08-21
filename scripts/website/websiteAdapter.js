import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

export class WebsiteAdapter {
  constructor(baseUrl = 'https://thewondercub.store') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.products = [
      {
        id: 'jungle-safari-bundle',
        name: 'Jungle Safari Adventure (Volumes 1, 2 & 3 Bundle)',
        url: `${this.baseUrl}/jungle-safari`,
        price: 13.99,
        currency: 'USD',
        format: 'Printable PDF Instant Download',
        target_age: 'Ages 3–7',
        features: [
          '60 real animals with researched facts',
          'As Big As... size comparisons',
          '15+ activity pages and puzzles',
          'Quizzes in every volume',
          '3 printable explorer badges'
        ],
        bonus: '12-Page Jungle Safari Colouring Adventure & Champion Certificate ($9.99 value, included free)'
      }
    ];
  }

  async healthCheck() {
    try {
      const response = await fetch(this.baseUrl, { method: 'HEAD' });
      return {
        status: response.ok ? 'HEALTHY' : 'DEGRADED',
        statusCode: response.status,
        url: this.baseUrl,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return {
        status: 'UNREACHABLE',
        error: err.message,
        url: this.baseUrl,
        timestamp: new Date().toISOString()
      };
    }
  }

  getProducts() {
    return this.products;
  }

  getProduct(id = 'jungle-safari-bundle') {
    return this.products.find(p => p.id === id) || this.products[0];
  }

  buildUtmUrl(productId = 'jungle-safari-bundle', contentId, options = {}) {
    const product = this.getProduct(productId);
    const source = options.source || 'instagram';
    const medium = options.medium || 'organic_social';
    const now = new Date();
    const defaultCampaign = `${now.toLocaleString('default', { month: 'short' }).toLowerCase()}_${now.getFullYear()}`;
    const campaign = options.campaign || defaultCampaign;

    const url = new URL(product.url);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', campaign);
    if (contentId) {
      url.searchParams.set('utm_content', contentId);
    }

    return url.toString();
  }

  getMockSalesMetrics(contentId) {
    return {
      contentId,
      sessions: 48,
      productViews: 39,
      addToCarts: 14,
      checkouts: 8,
      purchases: 5,
      revenue: 69.95,
      currency: 'USD'
    };
  }
}

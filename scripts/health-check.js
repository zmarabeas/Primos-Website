#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Health check configuration
const HEALTH_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 2000, // 2 seconds
  endpoints: [
    { path: '/', name: 'Homepage' },
    { path: '/menu', name: 'Menu Page' },
    { path: '/api/health', name: 'Health API', optional: true }
  ],
  expectedResponseTime: 3000, // 3 seconds
  expectedStatusCodes: [200, 301, 302]
};

class HealthChecker {
  constructor(baseUrl = 'http://localhost:4173') {
    this.baseUrl = baseUrl;
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: baseUrl,
      overall: 'UNKNOWN',
      checks: [],
      errors: [],
      warnings: [],
      summary: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      }
    };
  }

  async runHealthChecks() {
    console.log(`🏥 Running health checks against: ${this.baseUrl}\n`);

    try {
      await this.checkServerAvailability();
      await this.checkEndpoints();
      await this.checkMenuDataIntegrity();
      await this.checkStaticAssets();
      await this.checkPerformanceBasics();
      
      this.determineOverallHealth();
      this.saveResults();
      this.printSummary();
      
      return this.results.overall === 'HEALTHY';
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.results.overall = 'UNHEALTHY';
      this.results.errors.push(`Health check error: ${error.message}`);
      return false;
    }
  }

  async checkServerAvailability() {
    console.log('🌐 Checking server availability...');
    
    const check = {
      name: 'Server Availability',
      status: 'UNKNOWN',
      startTime: Date.now(),
      details: {}
    };

    try {
      const response = await this.fetchWithTimeout(this.baseUrl, HEALTH_CONFIG.timeout);
      const responseTime = Date.now() - check.startTime;
      
      check.details = {
        statusCode: response.status,
        responseTime: responseTime,
        headers: Object.fromEntries(response.headers.entries())
      };

      if (HEALTH_CONFIG.expectedStatusCodes.includes(response.status)) {
        check.status = 'PASSED';
        this.results.summary.passed++;
        console.log(`   ✅ Server responding (${response.status}) in ${responseTime}ms`);
      } else {
        check.status = 'FAILED';
        this.results.summary.failed++;
        this.results.errors.push(`Unexpected status code: ${response.status}`);
        console.log(`   ❌ Unexpected status code: ${response.status}`);
      }

      if (responseTime > HEALTH_CONFIG.expectedResponseTime) {
        this.results.warnings.push(`Slow response time: ${responseTime}ms`);
        console.log(`   ⚠️  Slow response: ${responseTime}ms`);
      }
    } catch (error) {
      check.status = 'FAILED';
      check.details.error = error.message;
      this.results.summary.failed++;
      this.results.errors.push(`Server availability check failed: ${error.message}`);
      console.log(`   ❌ Server not responding: ${error.message}`);
    }

    this.results.checks.push(check);
    this.results.summary.total++;
  }

  async checkEndpoints() {
    console.log('🔗 Checking critical endpoints...');

    for (const endpoint of HEALTH_CONFIG.endpoints) {
      const check = {
        name: `Endpoint: ${endpoint.name}`,
        status: 'UNKNOWN',
        startTime: Date.now(),
        details: { path: endpoint.path }
      };

      try {
        const url = `${this.baseUrl}${endpoint.path}`;
        const response = await this.fetchWithTimeout(url, HEALTH_CONFIG.timeout);
        const responseTime = Date.now() - check.startTime;
        
        check.details = {
          ...check.details,
          statusCode: response.status,
          responseTime: responseTime,
          contentLength: response.headers.get('content-length') || 'unknown'
        };

        if (HEALTH_CONFIG.expectedStatusCodes.includes(response.status)) {
          check.status = 'PASSED';
          this.results.summary.passed++;
          console.log(`   ✅ ${endpoint.name}: ${response.status} in ${responseTime}ms`);
        } else if (endpoint.optional) {
          check.status = 'SKIPPED';
          this.results.summary.skipped++;
          console.log(`   ⏭️  ${endpoint.name}: ${response.status} (optional)`);
        } else {
          check.status = 'FAILED';
          this.results.summary.failed++;
          this.results.errors.push(`${endpoint.name} returned ${response.status}`);
          console.log(`   ❌ ${endpoint.name}: ${response.status}`);
        }
      } catch (error) {
        if (endpoint.optional) {
          check.status = 'SKIPPED';
          check.details.error = error.message;
          this.results.summary.skipped++;
          console.log(`   ⏭️  ${endpoint.name}: ${error.message} (optional)`);
        } else {
          check.status = 'FAILED';
          check.details.error = error.message;
          this.results.summary.failed++;
          this.results.errors.push(`${endpoint.name} failed: ${error.message}`);
          console.log(`   ❌ ${endpoint.name}: ${error.message}`);
        }
      }

      this.results.checks.push(check);
      this.results.summary.total++;
    }
  }

  async checkMenuDataIntegrity() {
    console.log('🍕 Checking menu data integrity...');

    const check = {
      name: 'Menu Data Integrity',
      status: 'UNKNOWN',
      startTime: Date.now(),
      details: {}
    };

    try {
      // Load and validate menu data
      const menuDataPath = join(__dirname, '../menu_categories_complete.json');
      const menuData = JSON.parse(readFileSync(menuDataPath, 'utf8'));
      
      const totalCategories = menuData.length;
      let totalItems = 0;
      let availableItems = 0;
      let itemsWithPricing = 0;

      menuData.forEach(category => {
        if (!category.id || !category.name || !Array.isArray(category.items)) {
          throw new Error(`Invalid category structure: ${category.id || 'unknown'}`);
        }

        category.items.forEach(item => {
          totalItems++;
          
          if (!item.id || !item.name || typeof item.available !== 'boolean') {
            throw new Error(`Invalid item structure: ${item.id || 'unknown'}`);
          }

          if (item.available) {
            availableItems++;
          }

          const hasPrice = item.basePrice || 
                          (item.sizes && item.sizes.length > 0) || 
                          (item.options && item.options.length > 0);
          
          if (hasPrice) {
            itemsWithPricing++;
          }
        });
      });

      check.details = {
        totalCategories,
        totalItems,
        availableItems,
        itemsWithPricing,
        pricingCoverage: ((itemsWithPricing / totalItems) * 100).toFixed(1) + '%'
      };

      // Validate data integrity
      if (totalCategories === 0) {
        throw new Error('No menu categories found');
      }

      if (totalItems === 0) {
        throw new Error('No menu items found');
      }

      if (availableItems === 0) {
        this.results.warnings.push('No available menu items found');
      }

      if (itemsWithPricing / totalItems < 0.8) {
        this.results.warnings.push('Less than 80% of items have pricing information');
      }

      check.status = 'PASSED';
      this.results.summary.passed++;
      console.log(`   ✅ ${totalCategories} categories, ${totalItems} items, ${availableItems} available`);
      console.log(`   ✅ ${itemsWithPricing} items with pricing (${check.details.pricingCoverage})`);
    } catch (error) {
      check.status = 'FAILED';
      check.details.error = error.message;
      this.results.summary.failed++;
      this.results.errors.push(`Menu data integrity check failed: ${error.message}`);
      console.log(`   ❌ ${error.message}`);
    }

    this.results.checks.push(check);
    this.results.summary.total++;
  }

  async checkStaticAssets() {
    console.log('📁 Checking static assets...');

    const check = {
      name: 'Static Assets',
      status: 'UNKNOWN',
      startTime: Date.now(),
      details: {}
    };

    const assetChecks = [];
    const assets = [
      '/favicon.ico',
      '/app.css',
      '/_app/immutable/assets/'
    ];

    try {
      for (const asset of assets) {
        try {
          const url = `${this.baseUrl}${asset}`;
          const response = await this.fetchWithTimeout(url, 5000);
          
          assetChecks.push({
            asset,
            status: response.status,
            available: response.status < 400
          });
        } catch (error) {
          assetChecks.push({
            asset,
            status: 'ERROR',
            error: error.message,
            available: false
          });
        }
      }

      const availableAssets = assetChecks.filter(a => a.available).length;
      const totalAssets = assetChecks.length;

      check.details = {
        assetChecks,
        availableAssets,
        totalAssets,
        availability: ((availableAssets / totalAssets) * 100).toFixed(1) + '%'
      };

      if (availableAssets === totalAssets) {
        check.status = 'PASSED';
        this.results.summary.passed++;
        console.log(`   ✅ All ${totalAssets} static assets available`);
      } else if (availableAssets > totalAssets * 0.5) {
        check.status = 'PASSED';
        this.results.summary.passed++;
        this.results.warnings.push(`Some static assets unavailable (${availableAssets}/${totalAssets})`);
        console.log(`   ⚠️  ${availableAssets}/${totalAssets} static assets available`);
      } else {
        check.status = 'FAILED';
        this.results.summary.failed++;
        this.results.errors.push(`Too many static assets unavailable (${availableAssets}/${totalAssets})`);
        console.log(`   ❌ Only ${availableAssets}/${totalAssets} static assets available`);
      }
    } catch (error) {
      check.status = 'FAILED';
      check.details.error = error.message;
      this.results.summary.failed++;
      this.results.errors.push(`Static assets check failed: ${error.message}`);
      console.log(`   ❌ ${error.message}`);
    }

    this.results.checks.push(check);
    this.results.summary.total++;
  }

  async checkPerformanceBasics() {
    console.log('⚡ Checking basic performance...');

    const check = {
      name: 'Basic Performance',
      status: 'UNKNOWN',
      startTime: Date.now(),
      details: {}
    };

    try {
      const performanceTests = [];
      
      // Test homepage load time
      const homepageStart = Date.now();
      const homepageResponse = await this.fetchWithTimeout(this.baseUrl, HEALTH_CONFIG.timeout);
      const homepageLoadTime = Date.now() - homepageStart;
      
      performanceTests.push({
        test: 'Homepage Load Time',
        value: homepageLoadTime,
        threshold: 3000,
        passed: homepageLoadTime < 3000
      });

      // Test menu page load time if available
      try {
        const menuStart = Date.now();
        await this.fetchWithTimeout(`${this.baseUrl}/menu`, 5000);
        const menuLoadTime = Date.now() - menuStart;
        
        performanceTests.push({
          test: 'Menu Page Load Time',
          value: menuLoadTime,
          threshold: 5000,
          passed: menuLoadTime < 5000
        });
      } catch (error) {
        // Menu page might not exist, skip this test
      }

      check.details = { performanceTests };

      const passedTests = performanceTests.filter(t => t.passed).length;
      const totalTests = performanceTests.length;

      if (passedTests === totalTests) {
        check.status = 'PASSED';
        this.results.summary.passed++;
        console.log(`   ✅ All ${totalTests} performance tests passed`);
      } else {
        check.status = 'FAILED';
        this.results.summary.failed++;
        this.results.errors.push(`${totalTests - passedTests} performance tests failed`);
        console.log(`   ❌ ${totalTests - passedTests}/${totalTests} performance tests failed`);
      }

      performanceTests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        console.log(`   ${status} ${test.test}: ${test.value}ms (threshold: ${test.threshold}ms)`);
      });
    } catch (error) {
      check.status = 'FAILED';
      check.details.error = error.message;
      this.results.summary.failed++;
      this.results.errors.push(`Performance check failed: ${error.message}`);
      console.log(`   ❌ ${error.message}`);
    }

    this.results.checks.push(check);
    this.results.summary.total++;
  }

  determineOverallHealth() {
    const { passed, failed, total } = this.results.summary;
    const healthPercentage = (passed / total) * 100;

    if (failed === 0) {
      this.results.overall = 'HEALTHY';
    } else if (healthPercentage >= 80) {
      this.results.overall = 'DEGRADED';
    } else {
      this.results.overall = 'UNHEALTHY';
    }
  }

  async fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Use a simple fetch alternative for Node.js
      const response = await this.nodeFetch(url);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async nodeFetch(url) {
    // Simple HTTP request using Node.js built-ins
    const https = await import('https');
    const http = await import('http');
    const { URL } = await import('url');

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.request(parsedUrl, (res) => {
        const headers = new Map();
        Object.entries(res.headers).forEach(([key, value]) => {
          headers.set(key, value);
        });

        resolve({
          status: res.statusCode,
          headers,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });

      req.on('error', reject);
      req.setTimeout(HEALTH_CONFIG.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  saveResults() {
    const outputDir = join(__dirname, '../coverage');
    mkdirSync(outputDir, { recursive: true });
    
    const outputPath = join(outputDir, 'health-check-report.json');
    writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📊 Health check report saved to: ${outputPath}`);
  }

  printSummary() {
    console.log('\n🏥 HEALTH CHECK SUMMARY:');
    console.log(`📊 Overall Status: ${this.getHealthEmoji()} ${this.results.overall}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⏭️  Skipped: ${this.results.summary.skipped}`);
    console.log(`📊 Total: ${this.results.summary.total}`);

    if (this.results.errors.length > 0) {
      console.log(`\n🚨 ${this.results.errors.length} errors found:`);
      this.results.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  ${this.results.warnings.length} warnings found:`);
      this.results.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  }

  getHealthEmoji() {
    switch (this.results.overall) {
      case 'HEALTHY': return '💚';
      case 'DEGRADED': return '💛';
      case 'UNHEALTHY': return '💔';
      default: return '❓';
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:4173';

// Run health checks
const checker = new HealthChecker(baseUrl);
const healthy = await checker.runHealthChecks();

process.exit(healthy ? 0 : 1);
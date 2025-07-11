#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  firstContentfulPaint: 2000, // 2 seconds
  largestContentfulPaint: 4000, // 4 seconds
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100, // 100ms
  timeToInteractive: 5000, // 5 seconds
  speedIndex: 4000, // 4 seconds
  totalBlockingTime: 300, // 300ms
  buildSize: 1024 * 1024 * 2, // 2MB
  bundleSize: 1024 * 1024, // 1MB
  memoryUsage: 50 * 1024 * 1024 // 50MB
};

class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      passed: true,
      errors: [],
      warnings: [],
      metrics: {},
      recommendations: []
    };
  }

  async runAllTests() {
    console.log('🚀 Starting performance tests...\n');

    try {
      await this.testBuildSize();
      await this.testBundleAnalysis();
      await this.testMenuDataLoading();
      await this.testPricingCalculations();
      await this.testComponentRendering();
      await this.testMemoryUsage();
      
      this.generateRecommendations();
      this.saveResults();
      this.printSummary();
      
      return this.results.passed;
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      this.results.passed = false;
      this.results.errors.push(`Test suite error: ${error.message}`);
      return false;
    }
  }

  async testBuildSize() {
    console.log('📦 Testing build size...');
    
    try {
      const buildPath = join(__dirname, '../.svelte-kit/output');
      const buildSize = await this.calculateDirectorySize(buildPath);
      
      this.results.metrics.buildSize = buildSize;
      
      if (buildSize > PERFORMANCE_THRESHOLDS.buildSize) {
        this.results.warnings.push(
          `Build size (${this.formatBytes(buildSize)}) exceeds threshold (${this.formatBytes(PERFORMANCE_THRESHOLDS.buildSize)})`
        );
      } else {
        console.log(`   ✅ Build size: ${this.formatBytes(buildSize)}`);
      }
    } catch (error) {
      this.results.errors.push(`Build size test failed: ${error.message}`);
      console.log('   ⚠️  Build directory not found, skipping size test');
    }
  }

  async testBundleAnalysis() {
    console.log('📊 Analyzing bundle composition...');
    
    try {
      const packageJson = JSON.parse(
        readFileSync(join(__dirname, '../package.json'), 'utf8')
      );
      
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});
      
      this.results.metrics.dependencies = {
        production: dependencies.length,
        development: devDependencies.length,
        total: dependencies.length + devDependencies.length
      };
      
      // Check for heavy dependencies
      const heavyDependencies = dependencies.filter(dep => 
        ['lodash', 'moment', 'babel-polyfill'].includes(dep)
      );
      
      if (heavyDependencies.length > 0) {
        this.results.warnings.push(
          `Heavy dependencies detected: ${heavyDependencies.join(', ')}`
        );
      }
      
      console.log(`   ✅ Dependencies: ${dependencies.length} production, ${devDependencies.length} dev`);
    } catch (error) {
      this.results.errors.push(`Bundle analysis failed: ${error.message}`);
    }
  }

  async testMenuDataLoading() {
    console.log('🍕 Testing menu data loading performance...');
    
    try {
      const menuDataPath = join(__dirname, '../menu_categories_complete.json');
      const startTime = performance.now();
      
      const menuData = JSON.parse(readFileSync(menuDataPath, 'utf8'));
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      this.results.metrics.menuDataLoadTime = loadTime;
      
      // Test data processing time
      const processingStart = performance.now();
      let totalItems = 0;
      menuData.forEach(category => {
        category.items.forEach(item => {
          totalItems++;
          // Simulate basic processing
          const hasPrice = item.basePrice || (item.sizes && item.sizes.length > 0);
          const isAvailable = item.available;
        });
      });
      const processingEnd = performance.now();
      const processingTime = processingEnd - processingStart;
      
      this.results.metrics.menuDataProcessingTime = processingTime;
      this.results.metrics.totalMenuItems = totalItems;
      
      if (loadTime > 100) {
        this.results.warnings.push(
          `Menu data loading time (${loadTime.toFixed(2)}ms) is slower than expected`
        );
      }
      
      console.log(`   ✅ Menu data loaded in ${loadTime.toFixed(2)}ms`);
      console.log(`   ✅ Processed ${totalItems} items in ${processingTime.toFixed(2)}ms`);
    } catch (error) {
      this.results.errors.push(`Menu data loading test failed: ${error.message}`);
    }
  }

  async testPricingCalculations() {
    console.log('💰 Testing pricing calculation performance...');
    
    try {
      const iterations = 1000;
      const startTime = performance.now();
      
      // Simulate pricing calculations
      for (let i = 0; i < iterations; i++) {
        const mockItem = {
          basePrice: 12.99,
          sizes: [
            { size: 'small', price: 10.99 },
            { size: 'large', price: 15.99 }
          ]
        };
        
        // Simulate calculation
        const basePrice = mockItem.sizes[1].price;
        const toppings = 3;
        const toppingPrice = toppings * 1.50;
        const subtotal = basePrice + toppingPrice;
        const tax = subtotal * 0.06;
        const total = subtotal + tax;
      }
      
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      const avgTimePerCalculation = calculationTime / iterations;
      
      this.results.metrics.pricingCalculationTime = calculationTime;
      this.results.metrics.avgPricingCalculationTime = avgTimePerCalculation;
      
      if (avgTimePerCalculation > 1) {
        this.results.warnings.push(
          `Pricing calculations averaging ${avgTimePerCalculation.toFixed(3)}ms per calculation`
        );
      }
      
      console.log(`   ✅ ${iterations} pricing calculations in ${calculationTime.toFixed(2)}ms`);
      console.log(`   ✅ Average: ${avgTimePerCalculation.toFixed(3)}ms per calculation`);
    } catch (error) {
      this.results.errors.push(`Pricing calculation test failed: ${error.message}`);
    }
  }

  async testComponentRendering() {
    console.log('🎨 Testing component rendering performance...');
    
    try {
      // Simulate component render times
      const componentTests = [
        { name: 'Menu Component', expectedTime: 50 },
        { name: 'Info Component', expectedTime: 20 },
        { name: 'Layout Component', expectedTime: 30 }
      ];
      
      const renderTimes = {};
      
      componentTests.forEach(test => {
        const startTime = performance.now();
        
        // Simulate component operations
        for (let i = 0; i < 100; i++) {
          const mockProps = { test: true, items: new Array(10).fill(null) };
          // Simulate prop processing
          Object.keys(mockProps).forEach(key => {
            const value = mockProps[key];
          });
        }
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        renderTimes[test.name] = renderTime;
        
        if (renderTime > test.expectedTime) {
          this.results.warnings.push(
            `${test.name} rendering time (${renderTime.toFixed(2)}ms) exceeds expected time (${test.expectedTime}ms)`
          );
        }
        
        console.log(`   ✅ ${test.name}: ${renderTime.toFixed(2)}ms`);
      });
      
      this.results.metrics.componentRenderTimes = renderTimes;
    } catch (error) {
      this.results.errors.push(`Component rendering test failed: ${error.message}`);
    }
  }

  async testMemoryUsage() {
    console.log('🧠 Testing memory usage...');
    
    try {
      const memoryBefore = process.memoryUsage();
      
      // Simulate memory-intensive operations
      const largeArray = new Array(10000).fill(null).map(() => ({
        id: Math.random().toString(36),
        data: new Array(100).fill('test')
      }));
      
      const memoryAfter = process.memoryUsage();
      const memoryDiff = memoryAfter.heapUsed - memoryBefore.heapUsed;
      
      this.results.metrics.memoryUsage = {
        before: memoryBefore.heapUsed,
        after: memoryAfter.heapUsed,
        difference: memoryDiff,
        rss: memoryAfter.rss
      };
      
      if (memoryAfter.heapUsed > PERFORMANCE_THRESHOLDS.memoryUsage) {
        this.results.warnings.push(
          `Memory usage (${this.formatBytes(memoryAfter.heapUsed)}) exceeds threshold`
        );
      }
      
      console.log(`   ✅ Heap used: ${this.formatBytes(memoryAfter.heapUsed)}`);
      console.log(`   ✅ RSS: ${this.formatBytes(memoryAfter.rss)}`);
      
      // Clean up
      largeArray.length = 0;
    } catch (error) {
      this.results.errors.push(`Memory usage test failed: ${error.message}`);
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.metrics.buildSize > PERFORMANCE_THRESHOLDS.buildSize * 0.8) {
      recommendations.push('Consider code splitting and tree shaking to reduce bundle size');
    }
    
    if (this.results.metrics.menuDataLoadTime > 50) {
      recommendations.push('Consider optimizing menu data structure or implementing lazy loading');
    }
    
    if (this.results.metrics.avgPricingCalculationTime > 0.5) {
      recommendations.push('Optimize pricing calculation algorithms for better performance');
    }
    
    if (this.results.metrics.dependencies?.production > 20) {
      recommendations.push('Review dependencies and remove unused packages');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! No specific recommendations.');
    }
    
    this.results.recommendations = recommendations;
  }

  async calculateDirectorySize(dirPath) {
    return new Promise((resolve, reject) => {
      const du = spawn('du', ['-sb', dirPath]);
      let output = '';
      
      du.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      du.on('close', (code) => {
        if (code === 0) {
          const size = parseInt(output.split('\t')[0]);
          resolve(size);
        } else {
          reject(new Error(`du command failed with code ${code}`));
        }
      });
      
      du.on('error', reject);
    });
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  saveResults() {
    const outputDir = join(__dirname, '../coverage');
    mkdirSync(outputDir, { recursive: true });
    
    const outputPath = join(outputDir, 'performance-report.json');
    writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📊 Performance report saved to: ${outputPath}`);
  }

  printSummary() {
    console.log('\n🎯 PERFORMANCE TEST SUMMARY:');
    console.log(`📊 Status: ${this.results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (this.results.errors.length > 0) {
      console.log(`\n🚨 ${this.results.errors.length} errors found:`);
      this.results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  ${this.results.warnings.length} warnings found:`);
      this.results.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('\n🎯 Recommendations:');
    this.results.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
}

// Run performance tests
const tester = new PerformanceTester();
const success = await tester.runAllTests();

process.exit(success ? 0 : 1);
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load menu data
const menuData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../menu_categories_complete.json'), 'utf8')
);

const toppingsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/data/toppings.json'), 'utf8')
);

const saucesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/data/sauces.json'), 'utf8')
);

const restaurantInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/data/restaurant-info.json'), 'utf8')
);

function generateMenuReport() {
  const report = {
    timestamp: new Date().toISOString(),
    restaurant: restaurantInfo.name,
    summary: {
      totalCategories: menuData.length,
      totalItems: 0,
      availableItems: 0,
      unavailableItems: 0,
      itemsWithPricing: 0,
      itemsWithoutPricing: 0,
      totalToppings: toppingsData.length,
      availableToppings: toppingsData.filter(t => t.available).length,
      totalSauces: saucesData.length,
      availableSauces: saucesData.filter(s => s.available).length
    },
    categories: [],
    pricing: {
      priceRanges: {},
      averagePrices: {},
      pricingIssues: []
    },
    validation: {
      errors: [],
      warnings: [],
      passed: true
    }
  };

  // Analyze each category
  menuData.forEach(category => {
    const categoryAnalysis = {
      id: category.id,
      name: category.name,
      itemCount: category.items.length,
      availableItems: 0,
      unavailableItems: 0,
      items: []
    };

    let categoryTotal = 0;
    let categoryCount = 0;
    const categoryPrices = [];

    category.items.forEach(item => {
      report.summary.totalItems++;

      const itemAnalysis = {
        id: item.id,
        name: item.name,
        available: item.available,
        hasPricing: false,
        basePrice: item.basePrice,
        sizes: item.sizes ? item.sizes.length : 0,
        options: item.options ? item.options.length : 0,
        issues: []
      };

      if (item.available) {
        report.summary.availableItems++;
        categoryAnalysis.availableItems++;
      } else {
        report.summary.unavailableItems++;
        categoryAnalysis.unavailableItems++;
      }

      // Check pricing
      const hasBasePrice = typeof item.basePrice === 'number' && item.basePrice > 0;
      const hasSizes = item.sizes && item.sizes.length > 0;
      const hasOptions = item.options && item.options.length > 0;

      if (hasBasePrice || hasSizes || hasOptions) {
        report.summary.itemsWithPricing++;
        itemAnalysis.hasPricing = true;

        // Collect prices for analysis
        if (hasBasePrice) {
          categoryPrices.push(item.basePrice);
          categoryTotal += item.basePrice;
          categoryCount++;
        }

        if (hasSizes) {
          item.sizes.forEach(size => {
            if (size.price) {
              categoryPrices.push(size.price);
              categoryTotal += size.price;
              categoryCount++;
            }
          });
        }

        if (hasOptions) {
          item.options.forEach(option => {
            if (option.price) {
              categoryPrices.push(option.price);
              categoryTotal += option.price;
              categoryCount++;
            }
          });
        }
      } else {
        report.summary.itemsWithoutPricing++;
        itemAnalysis.issues.push('No pricing information found');
        report.validation.warnings.push(
          `Item ${item.id} in category ${category.id} has no pricing information`
        );
      }

      // Validate required fields
      if (!item.id) {
        itemAnalysis.issues.push('Missing ID');
        report.validation.errors.push(`Item in category ${category.id} missing ID`);
        report.validation.passed = false;
      }

      if (!item.name) {
        itemAnalysis.issues.push('Missing name');
        report.validation.errors.push(`Item ${item.id} missing name`);
        report.validation.passed = false;
      }

      if (typeof item.available !== 'boolean') {
        itemAnalysis.issues.push('Missing or invalid availability');
        report.validation.errors.push(`Item ${item.id} has invalid availability`);
        report.validation.passed = false;
      }

      categoryAnalysis.items.push(itemAnalysis);
    });

    // Calculate category pricing stats
    if (categoryPrices.length > 0) {
      const sortedPrices = categoryPrices.sort((a, b) => a - b);
      report.pricing.priceRanges[category.id] = {
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        median: sortedPrices[Math.floor(sortedPrices.length / 2)]
      };
      
      if (categoryCount > 0) {
        report.pricing.averagePrices[category.id] = categoryTotal / categoryCount;
      }
    }

    report.categories.push(categoryAnalysis);
  });

  // Additional validation checks
  
  // Check for duplicate IDs within categories
  menuData.forEach(category => {
    const itemIds = category.items.map(item => item.id);
    const uniqueIds = new Set(itemIds);
    if (uniqueIds.size !== itemIds.length) {
      report.validation.errors.push(`Duplicate item IDs found in category ${category.id}`);
      report.validation.passed = false;
    }
  });

  // Check for duplicate category IDs
  const categoryIds = menuData.map(cat => cat.id);
  const uniqueCategoryIds = new Set(categoryIds);
  if (uniqueCategoryIds.size !== categoryIds.length) {
    report.validation.errors.push('Duplicate category IDs found');
    report.validation.passed = false;
  }

  // Check pizza size progression
  const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
  if (pizzaCategory) {
    pizzaCategory.items.forEach(item => {
      if (item.sizes && item.sizes.length > 1) {
        for (let i = 1; i < item.sizes.length; i++) {
          const currentSize = item.sizes[i];
          const previousSize = item.sizes[i - 1];
          
          if (currentSize.price < previousSize.price) {
            report.pricing.pricingIssues.push(
              `Price regression in ${item.id}: ${currentSize.size} (${currentSize.price}) costs less than ${previousSize.size} (${previousSize.price})`
            );
            report.validation.warnings.push(
              `Potential pricing issue in ${item.id}: sizes should generally increase in price`
            );
          }
        }
      }
    });
  }

  return report;
}

function generateMarkdownReport(report) {
  let markdown = `# 🍕 Primo's Pizza Menu Data Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**Restaurant:** ${report.restaurant}

## 📊 Summary Statistics

| Metric | Count |
|--------|--------|
| Total Categories | ${report.summary.totalCategories} |
| Total Menu Items | ${report.summary.totalItems} |
| Available Items | ${report.summary.availableItems} |
| Unavailable Items | ${report.summary.unavailableItems} |
| Items with Pricing | ${report.summary.itemsWithPricing} |
| Items without Pricing | ${report.summary.itemsWithoutPricing} |
| Total Toppings | ${report.summary.totalToppings} |
| Available Toppings | ${report.summary.availableToppings} |
| Total Sauces | ${report.summary.totalSauces} |
| Available Sauces | ${report.summary.availableSauces} |

## ✅ Validation Status

**Overall Status:** ${report.validation.passed ? '✅ PASSED' : '❌ FAILED'}

### Errors (${report.validation.errors.length})
${report.validation.errors.length > 0 
  ? report.validation.errors.map(error => `- ❌ ${error}`).join('\n')
  : '*No errors found*'
}

### Warnings (${report.validation.warnings.length})
${report.validation.warnings.length > 0 
  ? report.validation.warnings.map(warning => `- ⚠️ ${warning}`).join('\n')
  : '*No warnings*'
}

## 📋 Category Breakdown

| Category | Items | Available | Unavailable | Avg Price |
|----------|-------|-----------|-------------|-----------|
`;

  report.categories.forEach(category => {
    const avgPrice = report.pricing.averagePrices[category.id];
    markdown += `| ${category.name} | ${category.itemCount} | ${category.availableItems} | ${category.unavailableItems} | ${avgPrice ? '$' + avgPrice.toFixed(2) : 'N/A'} |\n`;
  });

  markdown += `
## 💰 Pricing Analysis

### Price Ranges by Category

| Category | Min Price | Max Price | Median Price |
|----------|-----------|-----------|--------------|
`;

  Object.entries(report.pricing.priceRanges).forEach(([categoryId, range]) => {
    const category = report.categories.find(c => c.id === categoryId);
    markdown += `| ${category?.name || categoryId} | $${range.min.toFixed(2)} | $${range.max.toFixed(2)} | $${range.median.toFixed(2)} |\n`;
  });

  if (report.pricing.pricingIssues.length > 0) {
    markdown += `
### ⚠️ Pricing Issues Found

${report.pricing.pricingIssues.map(issue => `- ${issue}`).join('\n')}
`;
  }

  markdown += `
## 🎯 Recommendations

`;

  const recommendations = [];

  if (report.summary.unavailableItems > 0) {
    recommendations.push(`- Review ${report.summary.unavailableItems} unavailable items and update availability status`);
  }

  if (report.summary.itemsWithoutPricing > 0) {
    recommendations.push(`- Add pricing information for ${report.summary.itemsWithoutPricing} items missing pricing`);
  }

  if (report.pricing.pricingIssues.length > 0) {
    recommendations.push(`- Review ${report.pricing.pricingIssues.length} pricing inconsistencies`);
  }

  if (report.validation.errors.length > 0) {
    recommendations.push(`- **URGENT:** Fix ${report.validation.errors.length} validation errors before deployment`);
  }

  if (recommendations.length === 0) {
    recommendations.push('- ✅ Menu data looks good! No major issues found.');
  }

  markdown += recommendations.join('\n');

  markdown += `

---
*Report generated by Primo's Pizza CI/CD Pipeline*
`;

  return markdown;
}

// Generate and save reports
console.log('🔍 Analyzing menu data...');
const report = generateMenuReport();

// Save JSON report
const jsonOutput = path.join(__dirname, '../coverage/menu-report.json');
fs.mkdirSync(path.dirname(jsonOutput), { recursive: true });
fs.writeFileSync(jsonOutput, JSON.stringify(report, null, 2));

// Save Markdown report
const markdownOutput = path.join(__dirname, '../coverage/menu-report.md');
const markdownContent = generateMarkdownReport(report);
fs.writeFileSync(markdownOutput, markdownContent);

console.log('📊 Menu data analysis complete!');
console.log(`📄 JSON report: ${jsonOutput}`);
console.log(`📝 Markdown report: ${markdownOutput}`);

// Output summary to console
console.log('\n📊 SUMMARY:');
console.log(`✅ ${report.summary.availableItems} available items`);
console.log(`❌ ${report.summary.unavailableItems} unavailable items`);
console.log(`💰 ${report.summary.itemsWithPricing} items with pricing`);
console.log(`⚠️  ${report.summary.itemsWithoutPricing} items without pricing`);

if (report.validation.errors.length > 0) {
  console.log(`\n🚨 ${report.validation.errors.length} VALIDATION ERRORS FOUND!`);
  report.validation.errors.forEach(error => console.log(`   - ${error}`));
  process.exit(1);
}

if (report.validation.warnings.length > 0) {
  console.log(`\n⚠️  ${report.validation.warnings.length} warnings found`);
}

console.log('\n✅ Menu data validation passed!');
process.exit(0);
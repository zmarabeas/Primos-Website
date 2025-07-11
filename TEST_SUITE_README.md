# 🍕 Primo's Pizza - Comprehensive Testing Suite

This document describes the complete testing infrastructure for Primo's Pizza website, designed to ensure menu data integrity, build quality, and deployment safety.

## 🎯 Overview

Our testing suite provides comprehensive coverage across multiple dimensions:

- **Menu Data Validation** - Ensures all menu items, pricing, and restaurant info is valid
- **Component Testing** - Tests Svelte components for functionality and accessibility  
- **Integration Testing** - Validates end-to-end workflows and data consistency
- **Order Flow Testing** - Confirms ordering process works correctly
- **Responsive Design** - Tests across multiple screen sizes and devices
- **Performance Testing** - Validates load times and resource usage
- **Health Checks** - Post-deployment validation and monitoring

## 🚀 Quick Start

### Running All Tests
```bash
# Install dependencies
npm install

# Run complete test suite
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Running Specific Test Categories
```bash
# Menu data validation
npm run test:menu-validation

# Pricing calculations
npm run test:pricing

# Integration tests
npm run test:integration

# Order flow tests
npm run test:order-flow

# Responsive design tests
npm run test:responsive
```

### Running CI Pipeline Locally
```bash
# Generate menu data report
npm run test:menu-data-report

# Performance tests
npm run test:performance

# Health check (requires running server)
npm run test:health-check

# Build and test
npm run build
npm run test:health-check http://localhost:4173
```

## 📁 Test Structure

```
tests/
├── menu-data-validation.test.js    # Menu data integrity tests
├── components.test.js               # Svelte component tests
├── integration.test.js              # End-to-end integration tests
├── order-flow.test.js              # Order process validation
└── responsive.test.js              # Responsive design tests

scripts/
├── generate-menu-report.js         # Menu data analysis
├── performance-test.js             # Performance validation
└── health-check.js                 # Post-deployment checks

src/lib/utils/
├── menu-validation.ts              # Menu validation utilities
├── pricing.ts                      # Pricing calculation logic
└── order-builder.ts               # Order building utilities
```

## 🧪 Test Categories

### 1. Menu Data Validation Tests

**Purpose**: Ensure all menu data is valid, complete, and consistent.

**What's Tested**:
- ✅ Menu structure integrity
- ✅ Required fields presence
- ✅ Pricing data completeness
- ✅ Category and item uniqueness
- ✅ Price progression logic
- ✅ Availability status
- ✅ Data type validation

**Example**:
```javascript
test('should validate all menu items have required fields', () => {
  menuData.forEach(category => {
    category.items.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.category).toBeDefined();
      expect(typeof item.available).toBe('boolean');
    });
  });
});
```

### 2. Component Tests

**Purpose**: Validate Svelte components render correctly and handle interactions.

**What's Tested**:
- ✅ Component rendering without crashes
- ✅ Props handling and data display
- ✅ User interactions (clicks, form inputs)
- ✅ Conditional rendering logic
- ✅ Accessibility attributes
- ✅ Responsive behavior

**Example**:
```javascript
test('should display menu items within categories', () => {
  render(Menu, { 
    props: { categories: mockMenuData }
  });
  
  expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
  expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
});
```

### 3. Integration Tests

**Purpose**: Validate end-to-end workflows and data consistency.

**What's Tested**:
- ✅ Menu loading and processing
- ✅ Pricing calculations across all items
- ✅ Order building workflows
- ✅ Data consistency validation
- ✅ Performance benchmarks
- ✅ Error handling scenarios

**Example**:
```javascript
test('should calculate prices correctly across all menu items', async () => {
  for (const category of menuData.categories) {
    for (const item of category.items) {
      const calculation = PricingCalculator.calculateItemPrice(item, null, [], 1);
      expect(calculation.total).toBeGreaterThan(0);
    }
  }
});
```

### 4. Order Flow Tests

**Purpose**: Ensure the ordering process works correctly for all item types.

**What's Tested**:
- ✅ Pizza ordering with toppings
- ✅ Appetizer and side orders
- ✅ Chicken piece selection
- ✅ Sandwich customization
- ✅ Cart management
- ✅ Pricing calculations
- ✅ Special instructions handling

**Example**:
```javascript
test('should create a complete pizza order with toppings', () => {
  const order = orderBuilder
    .setItem(cheesePizza)
    .setSize('large')
    .setToppings(['pepperoni', 'mushrooms'])
    .setQuantity(2)
    .build();

  expect(order.selectedToppings).toContain('pepperoni');
  expect(order.totalPrice).toBeGreaterThan(0);
});
```

### 5. Responsive Design Tests

**Purpose**: Validate website works across different screen sizes and devices.

**What's Tested**:
- ✅ Viewport adaptation (mobile, tablet, desktop)
- ✅ Navigation responsiveness
- ✅ Content layout adjustments
- ✅ Typography scaling
- ✅ Touch-friendly interactions
- ✅ Image responsiveness
- ✅ Performance across viewports

**Example**:
```javascript
test('should have touch-friendly targets on mobile', () => {
  setViewport(375, 667); // Mobile size
  
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    expect(Math.max(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
  });
});
```

## 🔧 Utility Scripts

### Menu Data Report Generator

Analyzes menu data and generates comprehensive reports.

```bash
npm run test:menu-data-report
```

**Output**:
- `coverage/menu-report.json` - Detailed analysis data
- `coverage/menu-report.md` - Human-readable report

**Analyzes**:
- Category and item counts
- Pricing coverage and consistency
- Data validation results
- Recommendations for improvements

### Performance Test Suite

Validates website performance and resource usage.

```bash
npm run test:performance
```

**Tests**:
- Build size analysis
- Bundle composition
- Menu data loading performance
- Pricing calculation speed
- Component rendering performance
- Memory usage validation

### Health Check System

Post-deployment validation and monitoring.

```bash
npm run test:health-check [url]
```

**Checks**:
- Server availability and response times
- Critical endpoint functionality
- Menu data integrity
- Static asset availability
- Basic performance metrics

## 🎭 GitHub Actions CI/CD Pipeline

Our comprehensive CI/CD pipeline includes:

### Job Flow
1. **Code Quality** - Linting, formatting, and type checking
2. **Menu Validation** - Data integrity and pricing validation
3. **Unit Tests** - Component and utility testing with coverage
4. **Build & Performance** - Build validation and performance testing
5. **Integration Tests** - End-to-end workflow validation
6. **Security Audit** - Dependency and vulnerability scanning
7. **Deploy Preview** - Preview deployment for PRs
8. **Deploy Production** - Production deployment for main branch
9. **Health Check** - Post-deployment validation

### Triggering CI
The pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Pipeline Status
- ✅ All checks must pass for merge
- 📊 Coverage reports uploaded to Codecov
- 🚀 Automatic deployments on success
- 📧 Notifications on failure

## 🎯 Coverage Goals

We maintain high testing standards:

- **Line Coverage**: > 80%
- **Function Coverage**: > 80%
- **Branch Coverage**: > 80%
- **Statement Coverage**: > 80%

### Coverage Reports
- Generated automatically on test runs
- Available in `coverage/` directory
- Uploaded to Codecov in CI
- HTML reports for local viewing

## 🛠️ Development Workflow

### Adding New Tests

1. **Menu Data Changes**:
   ```bash
   # Update menu_categories_complete.json
   npm run test:menu-validation
   ```

2. **New Components**:
   ```javascript
   // Add test in tests/components.test.js
   test('should render new component', () => {
     render(NewComponent, { props: mockProps });
     expect(screen.getByText('Expected Text')).toBeInTheDocument();
   });
   ```

3. **New Features**:
   ```javascript
   // Add integration test in tests/integration.test.js
   test('should handle new feature workflow', async () => {
     // Test end-to-end workflow
   });
   ```

### Test-Driven Development

1. Write failing test first
2. Implement minimum code to pass
3. Refactor and improve
4. Ensure all tests pass
5. Update documentation

### Debugging Tests

```bash
# Run tests in debug mode
npm run test:ui

# Run specific test file
npx vitest menu-data-validation

# Run tests with verbose output
npx vitest --reporter=verbose
```

## 📊 Monitoring and Alerts

### Continuous Monitoring
- Health checks run post-deployment
- Performance metrics tracked
- Menu data integrity verified
- Uptime monitoring enabled

### Alert Conditions
- Test failures in CI
- Performance degradation
- Menu data validation errors
- Health check failures
- Security vulnerabilities found

## 🔍 Troubleshooting

### Common Issues

**Tests failing after menu updates**:
```bash
# Validate menu data first
npm run test:menu-validation
# Check specific validation errors in output
```

**Performance tests failing**:
```bash
# Run build analysis
npm run build:analyze
# Check bundle size and dependencies
```

**Component tests breaking**:
```bash
# Check component props and structure
npm run test:watch
# Focus on specific component tests
```

### Getting Help

1. Check test output for specific error messages
2. Review this documentation for test examples
3. Look at existing tests for patterns
4. Use `npm run test:ui` for interactive debugging
5. Check CI logs for detailed error information

## 🚀 Best Practices

### Writing Tests
- Use descriptive test names
- Test behavior, not implementation
- Include both positive and negative cases
- Mock external dependencies
- Keep tests focused and isolated

### Menu Data
- Validate data after every change
- Ensure pricing consistency
- Maintain item availability accuracy
- Test with realistic data volumes

### Performance
- Monitor bundle size growth
- Test with realistic data loads
- Validate across different devices
- Keep performance budgets

### Maintenance
- Update tests when requirements change
- Review test coverage regularly
- Clean up obsolete tests
- Keep dependencies updated

---

**🎯 Remember**: Tests are not just about catching bugs - they're documentation of how our system should work and confidence that our customers will have a great experience ordering from Primo's Pizza!

For questions or improvements to the testing suite, please create an issue or submit a pull request.
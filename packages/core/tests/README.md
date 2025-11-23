# Test Suite Documentation

This directory contains comprehensive unit tests for the leaderboard application.

## Structure

```
tests/
├── fixtures/          # Test data and mock configurations
│   └── configs.ts     # Various config scenarios (valid/invalid)
├── lib/              # Tests for library modules
│   └── config.test.ts # Config validation tests
└── utils/            # Test utilities and helpers
    └── test-helpers.ts # Helper functions for testing
```

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Test Coverage

Current coverage for `lib/config.ts`: **94.11%**

### Config Validation Tests (36 tests)

The config validation test suite covers:

#### Valid Configurations (11 tests)
- ✅ Complete valid configuration with all fields
- ✅ Minimal valid configuration (only required fields)
- ✅ Configuration caching behavior
- ✅ Cache clearing and reloading
- ✅ Optional fields (socials, start_date)
- ✅ Multiple roles
- ✅ Scrapers with various configurations
- ✅ Valid cron expressions (standard and named)

#### Invalid Configurations - Missing Required Fields (6 tests)
- ✅ Missing org required fields (description, url, logo_url)
- ✅ Missing meta required fields (description, image_url, site_url, favicon_url)
- ✅ Empty roles object
- ✅ Role missing name field
- ✅ Scraper missing source field
- ✅ Missing top-level required sections

#### Invalid Configurations - Format Validation (4 tests)
- ✅ Invalid URL formats
- ✅ Invalid email format
- ✅ Invalid date format
- ✅ Invalid cron expression

#### Invalid Configurations - Additional Properties (2 tests)
- ✅ Unexpected fields in org
- ✅ Unexpected top-level fields

#### Environment Variable Substitution (5 tests)
- ✅ Substituting environment variables in scraper config
- ✅ Keeping template variables when env var not set
- ✅ Recursive substitution
- ✅ Env vars with underscores and numbers
- ✅ Not substituting partial matches

#### Scraper Configuration Validation (4 tests)
- ✅ Git URL source
- ✅ Local path source
- ✅ Multiple scrapers with different configurations
- ✅ Scraper key format validation (lowercase with underscores)

#### Edge Cases (4 tests)
- ✅ Empty scrapers object
- ✅ Role with empty description
- ✅ Special characters in string values
- ✅ Very long string values

## Test Fixtures

The `fixtures/configs.ts` file provides various configuration scenarios:

- `validConfig` - Complete valid configuration with all optional fields
- `minimalValidConfig` - Minimal configuration with only required fields
- `missingOrgFieldsConfig` - Missing required org fields
- `missingMetaFieldsConfig` - Missing required meta fields
- `emptyRolesConfig` - Empty roles object
- `invalidUrlsConfig` - Invalid URL formats
- `invalidEmailConfig` - Invalid email format
- `invalidDateConfig` - Invalid date format
- `scraperMissingSourceConfig` - Scraper without source field
- `invalidCronConfig` - Invalid cron expression
- `roleMissingNameConfig` - Role without name field
- `additionalPropertiesConfig` - Unexpected additional properties

## Test Utilities

The `utils/test-helpers.ts` file provides helper functions:

- `createTempConfig()` - Creates temporary config files
- `removeTempConfig()` - Removes temporary config files
- `backupConfig()` - Backs up original config.yaml
- `restoreConfig()` - Restores original config.yaml
- `replaceConfigWith()` - Replaces config.yaml with test config
- `setTestEnvVars()` - Sets environment variables for testing
- `clearTestEnvVars()` - Clears test environment variables
- `extractErrorPaths()` - Extracts error paths from validation messages
- `hasValidationError()` - Checks for specific validation errors

## Writing New Tests

When adding new tests:

1. **Add test fixtures** to `fixtures/configs.ts` if needed
2. **Use test helpers** to manage config files and environment variables
3. **Clean up** after tests using `beforeEach` and `afterEach` hooks
4. **Test both success and failure cases**
5. **Use descriptive test names** that explain what is being tested
6. **Group related tests** using `describe` blocks

### Example Test

```typescript
describe("New Feature", () => {
  let originalConfig: string | null;

  beforeEach(() => {
    originalConfig = backupConfig();
    clearConfigCache();
  });

  afterEach(() => {
    restoreConfig(originalConfig);
    clearConfigCache();
  });

  it("should handle new feature correctly", () => {
    const testConfig = {
      ...minimalValidConfig,
      newFeature: "value",
    };

    replaceConfigWith(testConfig);
    const config = getConfig();

    expect(config.newFeature).toBe("value");
  });
});
```

## Continuous Integration

Tests should be run in CI/CD pipelines before merging code. The test suite:

- ✅ Runs quickly (< 1 second)
- ✅ Has no external dependencies
- ✅ Cleans up after itself
- ✅ Provides clear error messages
- ✅ Achieves high code coverage

## Future Test Areas

As the application grows, consider adding tests for:

- [ ] Scraper execution logic
- [ ] Database operations
- [ ] API endpoints
- [ ] UI components
- [ ] Integration tests
- [ ] E2E tests


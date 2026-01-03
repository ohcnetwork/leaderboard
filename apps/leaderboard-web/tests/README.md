# Test Suite Documentation

This directory contains comprehensive unit tests for the leaderboard web application.

## Structure

```
tests/
├── fixtures/          # Test data and mock configurations
│   └── configs.ts     # Various config scenarios (valid/invalid)
├── config.test.ts     # Config validation tests
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

### Config Validation Tests

The config validation test suite covers:

#### Valid Configurations
- ✅ Complete valid configuration with all fields
- ✅ Minimal valid configuration (only required fields)
- ✅ Configuration caching behavior
- ✅ Cache clearing and reloading
- ✅ Optional fields (socials, start_date)
- ✅ Multiple roles
- ✅ Hidden roles functionality
- ✅ Theme configuration
- ✅ Scrapers with various configurations

#### Invalid Configurations - Missing Required Fields
- ✅ Missing org required fields (description, url, logo_url)
- ✅ Missing meta required fields (description, image_url, site_url, favicon_url)
- ✅ Role missing name field
- ✅ Scraper missing source field
- ✅ Missing top-level required sections

#### Invalid Configurations - Format Validation
- ✅ Invalid URL formats
- ✅ Invalid email format
- ✅ Invalid theme URL format

#### Environment Variable Substitution
- ✅ Substituting environment variables in scraper config
- ✅ Keeping template variables when env var not set
- ✅ Nested substitution
- ✅ Env vars in arrays
- ✅ Not substituting partial matches

#### Scraper Configuration Validation
- ✅ Valid scraper configurations
- ✅ Multiple scrapers
- ✅ Various source URL formats
- ✅ Optional scraper fields

#### Social Profiles Configuration
- ✅ Valid social profiles
- ✅ Empty social profiles object
- ✅ Various icon names
- ✅ Missing icon field validation
- ✅ Keys with underscores

#### Aggregates Configuration
- ✅ Valid aggregates (global and contributor)
- ✅ Optional aggregates
- ✅ Empty aggregates arrays
- ✅ Only global or contributor aggregates

#### Edge Cases
- ✅ Configuration without scrapers
- ✅ Role with empty description
- ✅ Special characters in strings
- ✅ Very long string values

## Validation with Zod

This test suite validates configuration using **Zod v4** schemas, providing:

- **Type-safe validation**: Automatic TypeScript type inference
- **Better error messages**: Clear, human-readable validation errors
- **Schema composition**: Reusable schema components
- **Runtime validation**: Ensure config matches expected structure

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
- `scraperInstanceMissingSourceConfig` - Scraper without source field
- `roleMissingNameConfig` - Role without name field
- `additionalPropertiesConfig` - Unexpected additional properties
- `invalidThemeConfig` - Invalid theme URL

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

- ✅ Runs quickly
- ✅ Has no external dependencies
- ✅ Cleans up after itself
- ✅ Provides clear error messages
- ✅ Uses Zod for type-safe validation

## Future Test Areas

As the application grows, consider adding tests for:

- [ ] Database operations
- [ ] API endpoints (if applicable)
- [ ] UI components
- [ ] Integration tests
- [ ] E2E tests


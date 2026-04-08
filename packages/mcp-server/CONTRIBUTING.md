# Contributing to MCP Server

Thank you for your interest in contributing to the Leaderboard MCP Server!

## Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/ohcnetwork/leaderboard.git
   cd leaderboard
   pnpm install
   ```

2. **Build the packages:**
   ```bash
   pnpm build:packages
   ```

3. **Set up development data:**
   ```bash
   pnpm setup:dev
   ```

4. **Run the MCP server in development:**
   ```bash
   cd packages/mcp-server
   pnpm dev
   ```

## Project Structure

```
packages/mcp-server/
├── src/
│   ├── tools/           # Tool implementations
│   │   ├── contributors.ts
│   │   ├── activities.ts
│   │   ├── leaderboard.ts
│   │   └── aggregates.ts
│   ├── types.ts         # Type definitions
│   ├── utils.ts         # Utility functions
│   ├── server.ts        # MCP server implementation
│   └── index.ts         # CLI entry point
├── package.json
└── README.md
```

## Adding a New Tool

1. **Define the tool schema** using Zod:
   ```typescript
   export const MyToolSchema = z.object({
     param1: z.string().describe("Description"),
     param2: z.number().optional().describe("Optional param"),
   });
   ```

2. **Implement the tool function:**
   ```typescript
   export async function myTool(
     args: z.infer<typeof MyToolSchema>,
     context: ServerContext,
   ): Promise<ToolResult> {
     try {
       // Query database
       const result = await someQuery(context.db, args);

       // Return success result
       return createSuccessResult(result);
     } catch (error) {
       return createErrorResult(error as Error);
     }
   }
   ```

3. **Register the tool** in `server.ts`:
   - Add to `ListToolsRequestSchema` handler
   - Add to `CallToolRequestSchema` handler switch statement

4. **Add tests** in `src/__tests__/`:
   ```typescript
   describe("myTool", () => {
     it("should return expected result", async () => {
       // Test implementation
     });
   });
   ```

5. **Update documentation:**
   - Add tool description to README.md
   - Add usage examples to USAGE.md

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use Zod for input validation
- Return structured `ToolResult` objects

## Testing

Run tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

Run tests with coverage:
```bash
pnpm test:coverage
```

## Type Checking

```bash
pnpm typecheck
```

## Building

```bash
pnpm build
```

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-new-tool
   ```

2. **Make your changes** following the code style

3. **Add tests** for new functionality

4. **Update documentation** as needed

5. **Commit your changes:**
   ```bash
   git commit -m "feat: add my-new-tool for querying X"
   ```

6. **Push and create a PR:**
   ```bash
   git push origin feature/my-new-tool
   ```

## Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Questions?

- Open an issue on GitHub
- Start a discussion
- Check existing documentation

Thank you for contributing! 🎉

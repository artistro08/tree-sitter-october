# Building tree-sitter-october

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tree-sitter-october.git
cd tree-sitter-october
```

2. Install dependencies:
```bash
npm install
```

## Building from Source

Since tree-sitter-cli may have path resolution issues on Windows with Node.js v25+, this package includes pre-generated parser files. To build the native addon:

```bash
npx node-gyp rebuild
```

## Regenerating the Parser (if needed)

If you need to regenerate the parser from `grammar.js`:

### On macOS/Linux or with Node.js v18/v20:

```bash
npm run build
```

This runs:
1. `tree-sitter generate` - Generates C parser from grammar.js
2. `node-gyp build` - Compiles the native addon

### Manual Generation

If you encounter issues with tree-sitter-cli:

1. Install tree-sitter-cli globally:
```bash
npm install -g tree-sitter-cli@0.20.8
```

2. Generate the parser:
```bash
tree-sitter generate
```

3. Build the native addon:
```bash
node-gyp rebuild
```

## Testing

Note: Testing requires Node.js v18 or v20 due to ABI compatibility.

```bash
node test.js
```

## Troubleshooting

### "Invalid language object" error
This usually indicates an ABI mismatch between Node.js version and tree-sitter. Use Node.js v18 or v20 LTS.

### Path resolution errors on Windows
The tree-sitter-cli tool may have issues with Node.js v25+ on Windows. Use Node.js v20 LTS, or use the pre-generated parser files included in the package.

### Build errors
Ensure you have the required build tools:
- **Windows**: Visual Studio 2017+ with C++ tools
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Linux**: `build-essential` package (`apt-get install build-essential`)

## File Structure

```
tree-sitter-october/
├── grammar.js              # Grammar definition
├── src/
│   ├── parser.c           # Generated C parser
│   ├── tree_sitter/
│   │   └── parser.h       # Tree-sitter parser header
│   └── node-types.json    # Node type definitions
├── bindings/
│   ├── node/              # Node.js bindings
│   ├── python/            # Python bindings (future)
│   └── rust/              # Rust bindings
├── queries/
│   ├── highlights.scm     # Syntax highlighting
│   └── tags.scm           # Code navigation
└── examples/              # Example October CMS templates
```

## Contributing

When making changes to the grammar:

1. Edit `grammar.js`
2. Regenerate the parser: `tree-sitter generate`
3. Test your changes: `tree-sitter test`
4. Build the addon: `node-gyp rebuild`
5. Test with Node.js: `node test.js`
6. Update tests and documentation

## Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build and test
4. Create git tag
5. Publish to npm: `npm publish`

# tree-sitter-october

[![npm](https://img.shields.io/npm/v/tree-sitter-october.svg)](https://www.npmjs.com/package/tree-sitter-october)

October CMS Twig grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

## Overview

This package provides a tree-sitter grammar for October CMS Twig templates. It extends the standard Twig grammar with October CMS specific features including:

### October CMS Specific Tags
- `{% page %}` - Renders page content
- `{% partial %}` - Include partials
- `{% content %}` - Render content blocks
- `{% component %}` - Render components
- `{% placeholder %}` - Define placeholders
- `{% scripts %}` - Include scripts
- `{% styles %}` - Include styles
- `{% flash %}` - Flash messages
- `{% framework %}` - Include October framework assets

### October CMS Specific Filters
- `|app` - Application URL
- `|page` - Page URL
- `|theme` - Theme asset URL
- `|media` - Media URL
- `|resize` - Image resizing
- `|md` - Markdown rendering

### October CMS Specific Functions
- `abort()` - Abort with HTTP status
- `redirect()` - Redirect to URL
- `dump()` - Debug output
- `str()` - String helpers
- `form()` - Form helpers
- `html()` - HTML helpers
- `config()` - Access config values
- `env()` - Access environment variables
- `session()` - Access session data
- `trans()` - Translation

## Requirements

- **Node.js**: v18.x or v20.x (LTS versions recommended)
  - Note: Node.js v25+ requires C++20, which may cause compatibility issues with tree-sitter 0.21
- **Python**: 3.x (for building native modules)
- **C++ Compiler**:
  - Windows: Visual Studio 2017 or later
  - macOS: Xcode Command Line Tools
  - Linux: GCC/G++

## Installation

```bash
npm install tree-sitter-october
```

## Usage

### Node.js

```javascript
const Parser = require('tree-sitter');
const October = require('tree-sitter-october');

const parser = new Parser();
parser.setLanguage(October);

const sourceCode = `
{% page %}
<h1>{{ title|app }}</h1>
{% component 'myComponent' %}
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### Python

```python
from tree_sitter import Language, Parser

October = Language('build/my-languages.so', 'october')
parser = Parser()
parser.set_language(October)

source_code = b"""
{% page %}
<h1>{{ title|app }}</h1>
"""

tree = parser.parse(source_code)
print(tree.root_node.sexp())
```

### Rust

Add this to your `Cargo.toml`:

```toml
[dependencies]
tree-sitter = "0.22"
tree-sitter-october = "1.0"
```

```rust
use tree_sitter::Parser;
use tree_sitter_october::language;

fn main() {
    let mut parser = Parser::new();
    parser.set_language(&language()).expect("Error loading October grammar");

    let source_code = r#"
    {% page %}
    <h1>{{ title|app }}</h1>
    "#;

    let tree = parser.parse(source_code, None).unwrap();
    println!("{}", tree.root_node().to_sexp());
}
```

## Editor Integration

### Neovim (nvim-treesitter)

Once published, you can install this grammar in Neovim using nvim-treesitter:

```lua
require'nvim-treesitter.configs'.setup {
  ensure_installed = { "october" },
  highlight = { enable = true },
}
```

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

## File Types

This grammar is designed to work with the following file extensions:
- `.htm` (October CMS templates)
- `.october`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

Based on the [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) grammar by gbprod.

## References

- [October CMS Documentation](https://docs.octobercms.com/)
- [October CMS Markup Guide](https://docs.octobercms.com/2.x/markup/templating.html)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)

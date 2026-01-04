# tree-sitter-october

Tree-sitter grammar for [October CMS](https://octobercms.com/) template files.

October CMS extends the Twig templating language and uses a unique three-section file structure. This grammar supports:

- **Configuration Section** (INI format) - Optional template parameters
- **PHP Code Section** - Optional server-side logic
- **Twig Markup Section** - Template rendering with October CMS extensions

## Features

- Full support for October CMS template file structure (`.htm` files)
- INI configuration section parsing
- PHP code section parsing
- Complete Twig syntax support
- October-specific Twig extensions:
  - Tags: `{% page %}`, `{% partial %}`, `{% component %}`, `{% content %}`, `{% placeholder %}`, `{% flash %}`, `{% ajaxPartial %}`
  - Variables: `this.page`, `this.layout`, `this.theme`, `this.param`, etc.
  - Filters and functions from October CMS

## Installation

```bash
npm install tree-sitter-october
```

## Usage

### With tree-sitter CLI

```bash
tree-sitter generate
tree-sitter test
```

### With Node.js

```javascript
const Parser = require('tree-sitter');
const October = require('tree-sitter-october');

const parser = new Parser();
parser.setLanguage(October);

const sourceCode = `
url = "/blog"
layout = "default"
==
function onStart() {
    $this['posts'] = Post::all();
}
==
<h1>{{ page.title }}</h1>
{% for post in posts %}
    <article>
        <h2>{{ post.title }}</h2>
        {{ post.content }}
    </article>
{% endfor %}
`;

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
```

### With Rust

```rust
use tree_sitter::Parser;

let code = r#"
url = "/blog"
layout = "default"
==
<h1>{{ page.title }}</h1>
"#;

let mut parser = Parser::new();
parser.set_language(&tree_sitter_october::language())
    .expect("Error loading October grammar");
let tree = parser.parse(code, None).unwrap();
```

## October CMS Template Structure

October CMS templates consist of up to three sections separated by `==`:

```
url = "/blog"
layout = "default"
[component]
param = "value"
==
<?php
function onStart() {
    $this['variable'] = 'value';
}
?>
==
<h1>{{ page.title }}</h1>
{% partial "sidebar" %}
```

1. **Configuration Section** (optional): INI-style settings
2. **PHP Section** (optional): Server-side code
3. **Twig Section** (required): Template markup

## Development

### Prerequisites

- Node.js and npm
- tree-sitter CLI: `npm install -g tree-sitter-cli`
- C compiler (for building the parser)
- Rust (optional, for Rust bindings)

### Building

```bash
# Install dependencies
npm install

# Generate parser
tree-sitter generate

# Build
tree-sitter build

# Run tests
tree-sitter test
```

### Testing

Add test cases in `test/corpus/` directory and run:

```bash
tree-sitter test
```

## Editor Integration

### Zed

See the companion [zed-october](../zed-october) extension.

### Neovim

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.october = {
  install_info = {
    url = "~/path/to/tree-sitter-october",
    files = {"src/parser.c", "src/scanner.c"},
    branch = "main",
  },
  filetype = "htm",
}
```

### Helix

Add to `~/.config/helix/languages.toml`:

```toml
[[language]]
name = "october"
scope = "source.october"
file-types = ["htm"]
roots = []
comment-token = "{#"
indent = { tab-width = 4, unit = "    " }

[[grammar]]
name = "october"
source = { path = "/path/to/tree-sitter-october" }
```

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [October CMS Documentation](https://octobercms.com/docs)
- [Tree-sitter Documentation](https://tree-sitter.github.io/)
- [Twig Documentation](https://twig.symfony.com/)

# Configuration and PHP Section Support

This document describes the support for October CMS configuration and PHP code sections in the tree-sitter-october grammar.

## Overview

October CMS templates consist of up to three sections separated by `==`:

1. **Configuration Section** (INI format)
2. **PHP Code Section**
3. **Markup Section** (Twig/HTML)

All sections are optional. The parser handles any valid combination of these sections.

## Configuration Section

The configuration section uses INI format syntax for defining template parameters and component settings.

### Syntax

```ini
key = value
another_key = "quoted value"

[section_name]
parameter = value
```

### Features

- **Simple properties**: `key = value` syntax
- **Section headers**: `[component]` grouping syntax
- **Comments**: Lines starting with `;`
- **Quoted values**: Support for both quoted and unquoted values

### Example

```ini
url = "/blog"
layout = "default"
title = "Blog Posts"

[component]
posts = "blogPosts"
postsPerPage = 10
==
```

### Parser Nodes

- `configuration_section`: The entire config section
- `ini_property`: A key-value pair
  - `ini_key`: The property key
  - `ini_value`: The property value
- `ini_section_header`: A section header like `[component]`
  - `ini_section_name`: The section name
- `ini_comment`: Comments starting with `;`

## PHP Code Section

The PHP code section allows you to define functions and import namespaces that will be available in your template.

### Syntax

```php
<?php
use Acme\Blog\Classes\Post;

function onStart()
{
    $this['posts'] = Post::get();
}
?>
==
```

### Features

- **Opening tag**: `<?php` or `<?`
- **PHP content**: Any valid PHP code (captured as text, not fully parsed)
- **Closing tag**: `?>` (optional)
- Simplified parsing: The content between tags is captured without full PHP AST parsing

### Example

```php
<?php
use Acme\Blog\Classes\Post;
use Acme\Blog\Classes\Category;

function onStart()
{
    $this['posts'] = Post::get();
    $this['categories'] = Category::all();
}

function onLoadMore()
{
    $this['posts'] = Post::paginate(10);
}
?>
==
```

### Parser Nodes

- `php_section`: The entire PHP section
- `php_open_tag`: The opening `<?php` or `<?`
- `php_content`: The PHP code content (as a single text node)
- `php_close_tag`: The closing `?>`

### Important Notes

- The PHP content is **not** parsed as a full PHP Abstract Syntax Tree
- It's captured as a single text node containing all the code
- This approach keeps the grammar simple and focused on October CMS template structure
- For detailed PHP code analysis, use a dedicated PHP parser

## Markup Section

The markup section contains Twig templates and HTML, which was the original focus of this parser.

See the main README.md for details on Twig syntax support.

## Template Structure Examples

### All Three Sections

```october
url = "/blog"
layout = "default"
==
<?php
use Acme\Blog\Classes\Post;

function onStart()
{
    $this['posts'] = Post::get();
}
?>
==
{% page %}
<h1>{{ title }}</h1>
{% for post in posts %}
    <p>{{ post.title }}</p>
{% endfor %}
```

### Configuration + Markup (No PHP)

```october
url = "/page"
layout = "default"
==
{% page %}
<h1>{{ title }}</h1>
```

### PHP + Markup (No Configuration)

```october
<?php
function onStart()
{
    $this['data'] = 'Hello';
}
?>
==
<h1>{{ data }}</h1>
```

### Markup Only (Backwards Compatible)

```october
{% page %}
<h1>{{ title }}</h1>
```

### Configuration Only

```october
url = "/page"
layout = "default"
==
```

### PHP Only

```october
<?php
function onStart()
{
    $this['data'] = 'Hello';
}
?>
==
```

## Testing

Run the comprehensive test suite:

```bash
# Using tree-sitter CLI (recommended for development)
tree-sitter parse examples/full-template.htm
tree-sitter parse examples/config-only.htm
tree-sitter parse examples/php-only.htm
tree-sitter parse examples/config-markup.htm
tree-sitter parse examples/markup-only.htm

# Using Node.js (requires Node v18 or v20, not v25)
node test-config-php.js
```

## Implementation Details

### Precedence Strategy

The grammar uses precedence values to help the parser choose the correct interpretation:

- Configuration and PHP sections have high precedence (10, 20)
- Configuration-including templates have precedence 3
- PHP-including templates have precedence 2
- Markup-only templates have precedence 1 (lowest)

This ensures that the parser correctly identifies section boundaries and doesn't incorrectly parse configuration or PHP as markup content.

### Section Separator

The `==` separator is tokenized to ensure it's recognized as a distinct boundary between sections, not as part of the content.

### Content Matching

- **Config section**: Matches only valid INI syntax (properties, sections, comments)
- **PHP section**: Matches content carefully to avoid consuming `?>` or `==` prematurely
- **Markup section**: Matches Twig directives, output expressions, comments, and content

## Limitations

1. **PHP Content Parsing**: The PHP code is not parsed into a full AST. Only the structure (opening tag, content, closing tag) is recognized. For detailed PHP analysis, use a dedicated PHP parser.

2. **INI Value Validation**: INI values are accepted as-is without validation of their format or type.

3. **Section Order**: The sections must appear in order: Configuration, PHP, Markup. Other orders are not supported by October CMS.

## References

- [October CMS Theme Documentation](https://docs.octobercms.com/4.x/cms/themes/themes.html)
- [October CMS Markup Guide](https://docs.octobercms.com/4.x/markup/template-guide.html)

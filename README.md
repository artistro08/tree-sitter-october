# tree-sitter-october

[October CMS](https://octobercms.com/) grammar for [tree-sitter](https://github.com/tree-sitter/tree-sitter).

October CMS is a CMS platform based on Laravel that uses Twig for templating with additional features including INI configuration sections and PHP code sections.

## Status

This is an initial implementation based on the Twig grammar. Currently provides full Twig syntax support for October CMS templates.

**Planned features:**
- INI configuration section parsing
- PHP code section parsing
- Section delimiter (`==`) support

## Installation

### NPM
```bash
npm install tree-sitter-october
```

### From source
```bash
git clone https://github.com/artistro08/tree-sitter-october
cd tree-sitter-october
npm install
npm run build
```

## Testing
```bash
npm test
```

## File Structure

October CMS templates consist of up to three sections separated by `==`:

```
url = "/blog"
layout = "default"
==
<?php
function onStart() {
    $this['posts'] = Post::all();
}
?>
==
<h1>{{ page.title }}</h1>
{% for post in posts %}
    {{ post.content }}
{% endfor %}
```

1. **Configuration (INI)** - Template metadata
2. **PHP Code** - Server-side logic
3. **Twig Markup** - Template rendering

## Credits

Based on [tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig) by gbprod.

## License

MIT License - Copyright (c) 2026 Devin Green (artistro08)

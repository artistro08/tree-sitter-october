# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Configuration section support** (INI format)
  - Parse INI-style configuration properties (key = value)
  - Support for INI section headers ([section_name])
  - Support for INI comments (;)
  - Proper handling of quoted and unquoted values
- **PHP code section support**
  - Parse PHP opening tags (<?php and <?)
  - Capture PHP code content
  - Parse PHP closing tags (?>)
  - Simplified PHP content parsing (captures code without full PHP AST parsing)
- **Multi-section template parsing**
  - Support for templates with all three sections (config, PHP, markup)
  - Support for any combination of sections (all sections are optional)
  - Proper handling of `==` section separators
- **Example templates**
  - Added full-template.htm (all three sections)
  - Added config-only.htm (configuration section only)
  - Added php-only.htm (PHP section only)
  - Added config-markup.htm (configuration and markup sections)
- **Test file** test-config-php.js for comprehensive testing of new features

## [1.0.0] - 2024-12-08

### Added
- Initial release of tree-sitter-october
- Full Twig template language support
- October CMS specific tags:
  - `{% page %}`, `{% partial %}`, `{% content %}`, `{% component %}`
  - `{% placeholder %}`, `{% scripts %}`, `{% styles %}`, `{% flash %}`
  - `{% framework %}`, `{% put %}`, `{% default %}`
  - `{% verbatim %}`
- October CMS specific filters:
  - `|app`, `|page`, `|theme`, `|media`
  - `|resize`, `|md`, `|markdown`
- October CMS specific functions:
  - `abort()`, `redirect()`, `dump()`
  - `str()`, `form()`, `html()`
  - `config()`, `env()`, `session()`, `trans()`, `input()`
- Node.js, Python, and Rust bindings
- Syntax highlighting queries
- Complete test suite

### Technical Details
- Based on tree-sitter-twig v1.0.2 by gbprod
- Language version: 14
- State count: 558
- Symbol count: 147

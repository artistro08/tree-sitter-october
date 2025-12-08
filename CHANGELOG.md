# Changelog

All notable changes to this project will be documented in this file.

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

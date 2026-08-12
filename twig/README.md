# tree-sitter-october-twig

The Twig grammar used for the template section of an October CMS `.htm` file.

Vendored from [gbprod/tree-sitter-twig](https://github.com/gbprod/tree-sitter-twig)
at `0afd9a6d808944e65a7be393e31868b85345735f`, with two changes.

## 1. Renamed to `october_twig`

Zed registers tree-sitter grammars in one global namespace. A grammar named `twig`
here would collide with the one a standalone Twig extension registers, and whichever
loaded last would win for both extensions.

## 2. `tag_statement` accepts named parameters

October passes arguments to its tags by name:

```twig
{% partial 'site/footer' year=2026 theme='dark' %}
{% component 'blogPosts' pageNumber=2 %}
```

Upstream Twig has no such form, so the `=` parsed as an error and everything after
it in the tag lost its highlighting. The rule now allows an optional
`argument_name` before each expression, matching how `arguments` already handles
function calls:

```js
repeat(prec.left(seq(optional($.argument_name), $._expression)))
```

All 48 upstream corpus tests still pass.

## Regenerating

```sh
cd twig
tree-sitter generate
tree-sitter test
```

## License

WTFPL, inherited from gbprod/tree-sitter-twig. See `LICENCE`.

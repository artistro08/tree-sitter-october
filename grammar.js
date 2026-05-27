/**
 * tree-sitter-october
 *
 * Minimal host grammar for October CMS .htm templates.
 * Files contain up to three sections separated by lines starting with "==":
 *   1. INI configuration
 *   2. PHP code
 *   3. Twig template
 *
 * Section type is determined by POSITION, not content. The grammar treats
 * each section as an opaque chunk; real highlighting is delegated to the
 * ini / php_only / twig grammars via language injections.
 */

module.exports = grammar({
  name: 'october',

  externals: $ => [
    $._separator,
    $._chunk
  ],

  extras: () => [],

  rules: {
    // Top level shape is chosen by separator count. Each section is optional
    // so empty sections (e.g. "==\n==\n" with no PHP content) still parse.
    template: $ => choice(
      // 2 separators -> [INI] + [PHP] + [Twig]
      prec.dynamic(3, seq(
        optional($.ini_section),
        $.separator,
        optional($.php_section),
        $.separator,
        optional($.twig_section)
      )),
      // 1 separator -> [INI] + [Twig]
      prec.dynamic(2, seq(
        optional($.ini_section),
        $.separator,
        optional($.twig_section)
      )),
      // 0 separators -> [Twig]
      prec.dynamic(1, optional($.twig_section))
    ),

    separator: $ => $._separator,

    ini_section:  $ => alias($._chunk, $.ini_content),
    php_section:  $ => alias($._chunk, $.php_content),
    twig_section: $ => alias($._chunk, $.twig_content),
  }
});

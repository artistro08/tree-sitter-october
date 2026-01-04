/**
 * Tree-sitter grammar for October CMS templates
 *
 * October CMS template files consist of up to three sections:
 * 1. Configuration section (INI format) - optional
 * 2. PHP code section - optional
 * 3. Twig markup section - required
 *
 * Sections are separated by the == delimiter
 */

module.exports = grammar({
  name: 'october',

  externals: $ => [
    $.content
  ],

  extras: $ => [],

  conflicts: $ => [
    [$._expression, $.binary_expression],
    [$.subscript_expression],
  ],

  rules: {
    // Main template structure
    template: $ => seq(
      optional($.configuration_section),
      optional($.php_section),
      $.twig_section
    ),

    // Section separator
    section_separator: $ => /=={2,}/,

    // ===== Configuration Section (INI format) =====
    configuration_section: $ => seq(
      repeat(choice(
        $.ini_entry,
        $.ini_section_header,
        $.comment_line,
        /\r?\n/
      )),
      $.section_separator,
      /\r?\n/
    ),

    ini_section_header: $ => seq(
      '[',
      /[^\]]+/,
      ']',
      /\r?\n/
    ),

    ini_entry: $ => seq(
      field('key', $.ini_key),
      optional(seq(
        /[ \t]*/,
        '=',
        /[ \t]*/,
        field('value', $.ini_value)
      )),
      /\r?\n/
    ),

    ini_key: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    ini_value: $ => choice(
      $.quoted_string,
      $.unquoted_string,
      $.number
    ),

    quoted_string: $ => choice(
      seq('"', optional(/[^"]+/), '"'),
      seq("'", optional(/[^']+/), "'")
    ),

    unquoted_string: $ => /[^\r\n]+/,

    comment_line: $ => /;[^\r\n]*/,

    // ===== PHP Section =====
    php_section: $ => seq(
      optional(/\r?\n/),
      choice(
        // PHP code without <?php tags (just raw PHP)
        seq(
          alias($._php_content, $.php_code),
          $.section_separator,
          /\r?\n/
        ),
        // PHP code with <?php tags
        seq(
          '<?php',
          optional(/\r?\n/),
          alias($._php_content, $.php_code),
          optional('?>'),
          optional(/\r?\n/),
          $.section_separator,
          /\r?\n/
        )
      )
    ),

    _php_content: $ => repeat1(choice(
      /[^=?]+/,
      /=[^=]/,
      /\?[^>]/
    )),

    // ===== Twig Section =====
    twig_section: $ => repeat(choice(
      $.statement_directive,
      $.output_directive,
      $.comment,
      $.content
    )),

    // Twig statement directives {% ... %}
    statement_directive: $ => seq(
      '{%',
      optional(/[ \t]/),
      field('statement', $._statement),
      optional(/[ \t]/),
      '%}'
    ),

    _statement: $ => choice(
      $.set_statement,
      $.if_statement,
      $.for_statement,
      $.block_statement,
      $.macro_statement,
      $.import_statement,
      $.from_statement,
      $.filter_statement,
      $.auto_escape_statement,
      $.do_statement,
      $.flush_statement,
      $.verbatim_statement,
      $.apply_statement,
      $.embed_statement,
      $.use_statement,
      // October CMS specific tags
      $.page_statement,
      $.partial_statement,
      $.component_statement,
      $.content_statement,
      $.placeholder_statement,
      $.flash_statement,
      // Generic statement for other tags
      $.generic_statement
    ),

    // Set statement
    set_statement: $ => prec.right(seq(
      'set',
      field('variable', $.identifier),
      '=',
      field('value', $._expression)
    )),

    // If statement
    if_statement: $ => seq(
      'if',
      field('condition', $._expression)
    ),

    // For statement
    for_statement: $ => seq(
      'for',
      field('variable', choice(
        $.identifier,
        seq($.identifier, ',', $.identifier)
      )),
      'in',
      field('iterable', $._expression)
    ),

    // Block statement
    block_statement: $ => seq(
      'block',
      field('name', $.identifier)
    ),

    // Macro statement
    macro_statement: $ => seq(
      'macro',
      field('name', $.identifier),
      '(',
      optional($._parameter_list),
      ')'
    ),

    // Import statement
    import_statement: $ => seq(
      'import',
      field('template', $._expression),
      optional(seq('as', field('alias', $.identifier)))
    ),

    // From statement
    from_statement: $ => seq(
      'from',
      field('template', $._expression),
      'import',
      commaSep1(field('item', $.identifier))
    ),

    // Filter statement
    filter_statement: $ => seq(
      'filter',
      field('filter', $.identifier)
    ),

    // Auto-escape statement
    auto_escape_statement: $ => seq(
      'autoescape',
      optional(field('strategy', choice('html', 'js', 'css', 'url', 'html_attr', false)))
    ),

    // Do statement
    do_statement: $ => seq(
      'do',
      field('expression', $._expression)
    ),

    // Flush statement
    flush_statement: $ => 'flush',

    // Verbatim statement
    verbatim_statement: $ => 'verbatim',

    // Apply statement
    apply_statement: $ => seq(
      'apply',
      field('filter', $.identifier)
    ),

    // Embed statement
    embed_statement: $ => seq(
      'embed',
      field('template', $._expression)
    ),

    // Use statement
    use_statement: $ => seq(
      'use',
      field('template', $._expression)
    ),

    // October CMS specific statements
    page_statement: $ => 'page',

    partial_statement: $ => seq(
      'partial',
      field('name', $._expression)
    ),

    component_statement: $ => seq(
      'component',
      field('name', $.string)
    ),

    content_statement: $ => seq(
      'content',
      field('name', $.string)
    ),

    placeholder_statement: $ => seq(
      'placeholder',
      field('name', $.identifier)
    ),

    flash_statement: $ => seq(
      'flash',
      field('type', $.identifier)
    ),

    // Generic statement for any other tag
    generic_statement: $ => seq(
      field('tag', choice(
        'end',
        'else',
        'elseif',
        'endif',
        'endfor',
        'endblock',
        'endmacro',
        'endfilter',
        'endautoescape',
        'endverbatim',
        'endapply',
        'endembed',
        'endset',
        'ajaxPartial',
        /[a-zA-Z_][a-zA-Z0-9_]*/
      )),
      optional($._expression_list)
    ),

    // Twig output directives {{ ... }}
    output_directive: $ => seq(
      '{{',
      optional(/[ \t]/),
      field('expression', $._expression),
      optional(/[ \t]/),
      '}}'
    ),

    // Twig comments {# ... #}
    comment: $ => seq(
      '{#',
      /[^#]*#*/,
      '#}'
    ),

    // ===== Expressions =====
    _expression: $ => choice(
      $.literal,
      $.identifier,
      $.array,
      $.hash,
      $.binary_expression,
      $.unary_expression,
      $.ternary_expression,
      $.function_call,
      $.filter_expression,
      $.test_expression,
      $.subscript_expression,
      $.member_expression,
      $.parenthesized_expression,
      $.arrow_function
    ),

    _expression_list: $ => repeat1($._expression),

    // Literals
    literal: $ => choice(
      $.string,
      $.number,
      $.boolean,
      $.null
    ),

    string: $ => choice(
      seq('"', optional(repeat(choice(
        $._string_content_double,
        $.interpolation
      ))), '"'),
      seq("'", optional(/[^']+/), "'")
    ),

    _string_content_double: $ => /[^"#]+|#(?!\{)/,

    interpolation: $ => seq(
      '#{',
      field('expression', $._expression),
      '}'
    ),

    number: $ => /-?[0-9]+(\.[0-9]+)?/,

    boolean: $ => choice('true', 'false'),

    null: $ => 'null',

    // Identifiers
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Array literals
    array: $ => seq(
      '[',
      optional(commaSep($._expression)),
      optional(','),
      ']'
    ),

    // Hash literals
    hash: $ => seq(
      '{',
      optional(commaSep($.hash_entry)),
      optional(','),
      '}'
    ),

    hash_entry: $ => seq(
      field('key', choice($.identifier, $.string, $.parenthesized_expression)),
      ':',
      field('value', $._expression)
    ),

    // Binary expressions
    binary_expression: $ => choice(
      ...[
        ['or', 1],
        ['and', 2],
        ['b-or', 3],
        ['b-xor', 4],
        ['b-and', 5],
        ['==', 6],
        ['!=', 6],
        ['<', 7],
        ['>', 7],
        ['>=', 7],
        ['<=', 7],
        ['not in', 7],
        ['in', 7],
        ['matches', 7],
        ['starts with', 7],
        ['ends with', 7],
        ['..', 8],
        ['+', 9],
        ['-', 9],
        ['~', 10],
        ['*', 11],
        ['/', 11],
        ['//', 11],
        ['%', 11],
        ['**', 12],
        ['??', 13],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression)
        ))
      )
    ),

    // Unary expressions
    unary_expression: $ => prec(14, seq(
      field('operator', choice('not', '-', '+')),
      field('operand', $._expression)
    )),

    // Ternary expressions
    ternary_expression: $ => prec.right(0, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression)
    )),

    // Function calls
    function_call: $ => prec(15, seq(
      field('function', $.identifier),
      '(',
      optional(commaSep($._argument)),
      optional(','),
      ')'
    )),

    _argument: $ => choice(
      $._expression,
      $.named_argument
    ),

    named_argument: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression)
    ),

    _parameter_list: $ => commaSep1(choice(
      $.identifier,
      seq($.identifier, '=', $._expression)
    )),

    // Filter expressions
    filter_expression: $ => prec.left(16, seq(
      field('expression', $._expression),
      '|',
      field('filter', $.identifier),
      optional(seq(
        '(',
        optional(commaSep($._argument)),
        optional(','),
        ')'
      ))
    )),

    // Test expressions
    test_expression: $ => prec.left(17, seq(
      field('expression', $._expression),
      'is',
      optional('not'),
      field('test', $.identifier),
      optional(seq(
        '(',
        optional(commaSep($._expression)),
        ')'
      ))
    )),

    // Subscript expressions
    subscript_expression: $ => prec(18, seq(
      field('object', $._expression),
      '[',
      field('index', $._expression),
      ']'
    )),

    // Member expressions
    member_expression: $ => prec.left(18, seq(
      field('object', $._expression),
      '.',
      field('property', $.identifier)
    )),

    // Parenthesized expressions
    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')'
    ),

    // Arrow functions
    arrow_function: $ => seq(
      '(',
      optional($._parameter_list),
      ')',
      '=>',
      field('body', $._expression)
    ),
  }
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

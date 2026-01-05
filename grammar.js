const REGEX_NAME = /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/;
const REGEX_STRING_SIMPLE_QUOTED = /\'([^\'\\\\]*(?:\\\\.[^\'\\\\]*)*)\'/;
const REGEX_STRING_INTERPOLATED = /[^#"\\\\]+/;
const REGEX_NUMBER = /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/;

module.exports = grammar({
  name: 'october',
  extras: () => [/[ \t\r\n]/],  // Allow whitespace including newlines
  externals: $ => [
    $._section_delimiter_token
  ],
  conflicts: $ => [
    [$.configuration_section, $.twig_section],
    [$.php_section, $.twig_section],
  ],
  rules: {
    // October CMS template: Try sections FIRST with high precedence, Twig as fallback
    // Higher precedence for patterns with more specific sections (PHP/INI)
    template: ($) =>
      choice(
        // Config + PHP + Twig (highest priority)
        prec.dynamic(100, seq($.configuration_section, $.php_section, $.twig_section)),
        // Config + PHP (no Twig) - higher than Config + Twig!
        prec.dynamic(95, seq($.configuration_section, $.php_section)),
        // Config + Twig
        prec.dynamic(90, seq($.configuration_section, $.twig_section)),
        // PHP + Twig
        prec.dynamic(85, seq($.php_section, $.twig_section)),
        // Just Config
        prec.dynamic(70, $.configuration_section),
        // Just PHP
        prec.dynamic(65, $.php_section),
        // Just Twig (LOWEST priority - last resort)
        prec.dynamic(-100, $.twig_section)
      ),

    // Section delimiter: ==
    section_delimiter: ($) => $._section_delimiter_token,

    // ===== INI Configuration Section =====
    configuration_section: ($) =>
      prec(100, seq(
        repeat1(choice($.ini_setting, $.ini_section_header, /\r?\n/)),
        $.section_delimiter
      )),

    ini_section_header: () => token(seq('[', /[^\]\r\n]+/, ']')),

    ini_setting: () =>
      token(prec(10, seq(
        /[a-zA-Z_][a-zA-Z0-9_]*/,  // key
        optional(/\[[^\]]+\]/),  // optional array index like [en]
        /[ \t]*/,
        '=',
        /[ \t]*/,
        /[^\r\n]+/  // value
      ))),

    // ===== PHP Code Section =====
    php_section: ($) =>
      prec(100, seq(
        $.php_code,
        $.section_delimiter
      )),

    // PHP code with separate content node for injection
    php_code: ($) => seq(
      '<?php',
      optional($.php_content),
      optional('?>')
    ),

    // PHP content - this is what gets injected for syntax highlighting
    php_content: () => token(prec(-1, /([^?]+|\?[^>])+/)),

    // ===== Twig Section =====
    twig_section: ($) =>
      repeat1(choice(
        $.statement_directive,
        $.output_directive,
        $.comment,
        $.content
      )),

    // Content: HTML/text but NOT Twig delimiters or PHP tags
    // Explicitly avoid matching < followed by ? (PHP tags)
    content: () => token(prec(-100, repeat1(/[^\{<]+|<[^?]|\{[^%{#]/))),

    comment: () => seq('{#', /[^#]*\#+([^\}#][^#]*\#+)*/, '}'),

    statement_directive: ($) =>
      seq(choice('{%', '{%-', '{%~'), $._statement, choice('%}', '-%}', '~%}')),

    _statement: ($) =>
      choice(
        $.assignment_statement,
        $.for_statement,
        $.if_statement,
        $.macro_statement,
        $.import_statement,
        $.from_statement,

        alias($.include_statement, $.tag_statement),
        alias($.with_statement, $.tag_statement),
        $.tag_statement
      ),

    assignment_statement: ($) =>
      seq(
        alias('set', $.keyword),
        alias($.identifier, $.variable),
        repeat(seq(',', alias($.identifier, $.variable))),
        optional(seq('=', $._expression, repeat(seq(',', $._expression))))
      ),

    for_statement: ($) =>
      seq(
        alias('for', $.repeat),
        seq(
          alias($._name, $.variable),
          repeat(seq(',', alias($._name, $.variable)))
        ),
        alias('in', $.keyword),
        $._expression
      ),

    if_statement: ($) =>
      choice(
        seq(alias(choice('if', 'elseif'), $.conditional), $._expression),
        alias('else', $.conditional)
      ),

    tag_statement: ($) =>
      seq(
        choice(
          alias('endif', $.conditional),
          alias('endfor', $.repeat),
          alias($._name, $.tag)
        ),
        repeat(prec.left($._expression))
      ),

    include_statement: ($) =>
      seq(
        alias(choice('include', 'embed'), $.tag),
        $._expression,
        repeat(
          choice(
            seq(alias('with', $.attribute), $._expression),
            alias('only', $.attribute),
            alias('ignore missing', $.attribute)
          )
        )
      ),

    with_statement: ($) =>
      seq(
        alias('with', $.tag),
        $._expression,
        optional(alias('only', $.attribute))
      ),

    macro_statement: ($) =>
      seq(
        alias('macro', $.tag),
        alias($._name, $.method),
        optional($.parameters)
      ),

    parameters: ($) =>
      seq('(', optional(seq($.parameter, repeat(seq(',', $.parameter)))), ')'),

    parameter: ($) => seq($._name, optional(seq('=', $._literal))),

    import_statement: ($) =>
      seq(
        alias('import', $.tag),
        $._expression,
        alias('as', $.keyword),
        alias($._name, $.name)
      ),

    from_statement: ($) =>
      seq(
        alias('from', $.tag),
        $._expression,
        alias('import', $.keyword),
        alias($._name, $.name),
        optional(
          seq(
            alias('as', $.keyword),
            alias($._name, $.name),
            repeat(seq(',', alias($._name, $.name)))
          )
        )
      ),

    output_directive: ($) =>
      seq(
        choice('{{', '{{-', '{{~'),
        $._expression,
        choice('}}', '-}}', '~}}')
      ),

    _expression: ($) =>
      prec.right(
        seq(
          choice(
            alias($.identifier, $.variable),
            $._literal,
            $.function_call,
            seq('(', $._expression, ')'),
            $.unary_expression,
            $.binary_expression,
            $.test_expression,
            $.ternary_expression
          ),
          optional(repeat(seq('|', $.filter)))
        )
      ),

    identifier: ($) =>
      prec.left(
        seq(
          $._name,
          repeat(seq('.', $._name)),
          optional(
            seq(
              '[',
              choice(
                $._expression,
                seq(optional($._expression), ':', optional($._expression))
              ),
              ']'
            )
          )
        )
      ),
    _name: () => REGEX_NAME,

    _literal: ($) =>
      choice($._string, $.number, $.array, $.hash, $.boolean, $.null),

    boolean: () => choice('true', 'false'),
    null: () => 'null',
    _string: ($) =>
      choice(
        alias(REGEX_STRING_SIMPLE_QUOTED, $.string),
        $.interpolated_string
      ),

    interpolated_string: ($) =>
      seq(
        '"',
        repeat(
          choice(
            '\\"',
            '\\#',
            '\\\\',
            REGEX_STRING_INTERPOLATED,
            seq('#{', $._expression, '}')
          )
        ),
        '"'
      ),

    number: () => REGEX_NUMBER,
    array: ($) =>
      seq(
        '[',
        optional(seq($._expression, repeat(seq(',', $._expression)))),
        ']'
      ),
    hash: ($) =>
      seq(
        '{',
        optional(seq($._hash_entry, repeat(seq(',', $._hash_entry)))),
        optional(','),
        '}'
      ),
    _hash_entry: ($) =>
      seq(optional($.hash_key), alias($._expression, $.hash_value)),

    hash_key: ($) =>
      seq(
        choice(
          seq('(', $._expression, ')'),
          $._string,
          $.number,
          alias($._name, $.name)
        ),
        ':'
      ),

    function_call: ($) =>
      seq(alias($.identifier, $.function_identifier), $.arguments),

    arguments: ($) =>
      seq('(', optional(seq($.argument, repeat(seq(',', $.argument)))), ')'),

    argument: ($) =>
      seq(optional($.argument_name), alias($._expression, $.argument_value)),

    argument_name: () => seq(REGEX_NAME, '='),

    filter: ($) =>
      prec.left(
        seq(
          alias($.identifier, $.filter_identifier),
          optional(alias($.filter_arguments, $.arguments))
        )
      ),

    filter_arguments: ($) =>
      seq(
        '(',
        optional(
          seq(
            alias($.filter_argument, $.argument),
            repeat(seq(',', alias($.filter_argument, $.argument)))
          )
        ),
        ')'
      ),

    filter_argument: ($) =>
      seq(
        optional($.argument_name),
        choice($.arrow_function, alias($._expression, $.argument_value))
      ),

    arrow_function: ($) =>
      prec(
        100,
        seq(
          choice(
            alias($._name, $.name),
            seq(
              '(',
              optional(
                seq(
                  alias($._name, $.name),
                  repeat(seq(',', alias($._name, $.name)))
                )
              ),
              ')'
            )
          ),
          '=>',
          $._expression
        )
      ),

    binary_expression: ($) =>
      prec.right(
        seq(
          $._expression,
          seq(alias($.binary_operator, $.operator), $._expression)
        )
      ),

    test_expression: ($) =>
      prec.right(
        seq(
          $._expression,
          alias($.test_operator, $.operator),
          choice(
            seq(alias(repeat1(REGEX_NAME), $.test), optional($.arguments)),
            seq(
              alias(repeat1(REGEX_NAME), $.test),
              optional($.arguments),
              seq($.binary_operator, $._expression)
            )
          )
        )
      ),

    binary_operator: () =>
      choice(
        'or',
        'and',
        'b-or',
        'b-xor',
        'b-and',
        '==',
        '!=',
        '<=>',
        '<',
        '>',
        '>=',
        '<=',
        'not in',
        'in',
        'matches',
        'starts with',
        'ends with',
        '..',
        '+',
        '-',
        '~',
        '*',
        '/',
        '//',
        '%',
        '**',
        '??',
        '?:'
      ),

    unary_expression: ($) =>
      prec.left(seq(alias($.unary_operator, $.operator), $._expression)),

    unary_operator: () => choice('-', '+', 'not'),

    ternary_expression: ($) =>
      prec.left(
        seq(
          $._expression,
          '?',
          $._expression,
          optional(seq(':', $._expression))
        )
      ),

    test_operator: () => choice('is', 'is not'),
  },
});

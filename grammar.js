const REGEX_NAME = /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/;
const REGEX_STRING_SIMPLE_QUOTED = /\'([^\'\\\\]*(?:\\\\.[^\'\\\\]*)*)\'/;
const REGEX_STRING_INTERPOLATED = /[^#"\\\\]+/;
const REGEX_NUMBER = /[0-9]+(?:\.[0-9]+)?([Ee][\+\-][0-9]+)?/;

module.exports = grammar({
  name: 'october',
  extras: () => [/\s/],
  rules: {
    template: ($) =>
      choice(
        // All three sections
        prec(3, seq($.configuration_section, $.php_section, $.markup_section)),
        // Config and PHP only
        prec(3, seq($.configuration_section, $.php_section)),
        // Config and markup only
        prec(3, seq($.configuration_section, $.markup_section)),
        // PHP and markup only
        prec(2, seq($.php_section, $.markup_section)),
        // Config only
        prec(3, $.configuration_section),
        // PHP only
        prec(2, $.php_section),
        // Markup only (original behavior, lowest precedence)
        prec(1, $.markup_section)
      ),

    // Configuration section (INI format)
    configuration_section: ($) =>
      prec(10, seq(
        repeat1(choice($.ini_property, $.ini_section_header, $.ini_comment)),
        token('==')
      )),

    ini_comment: () => token(prec(20, seq(';', /.*/))),

    ini_property: ($) =>
      prec(20, seq(
        field('key', $.ini_key),
        token('='),
        field('value', $.ini_value)
      )),

    ini_key: () => token(prec(20, /[a-zA-Z_][a-zA-Z0-9_]*/)),

    ini_value: () =>
      choice(
        // Quoted string
        seq('"', /[^"\n]*/, '"'),
        // Unquoted value (not containing newlines or ==)
        /[^\n\r=]+/
      ),

    ini_section_header: ($) =>
      seq(
        '[',
        field('name', $.ini_section_name),
        ']'
      ),

    ini_section_name: () => /[^\]]+/,

    // PHP section - simplified to just capture content
    php_section: ($) =>
      prec(10, seq(
        $.php_open_tag,
        optional($.php_content),
        optional($.php_close_tag),
        '=='
      )),

    php_open_tag: () => token(prec(20, choice('<?php', '<?'))),

    php_close_tag: () => token(prec(10, '?>')),

    // Match PHP content carefully to avoid consuming ?> or ==
    php_content: ($) => repeat1(choice(
      /[^?=]+/,         // Any character except ? and =
      /\?[^>]/,         // ? followed by anything except >
      /=[^=]/           // Single = followed by anything except =
    )),

    // Markup section (Twig templates)
    markup_section: ($) =>
      repeat1(
        choice($.statement_directive, $.output_directive, $.comment, $.content)
      ),

    content: () => prec.right(repeat1(/[^\{]+|\{/)),

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
          $.october_tag,
          alias($._name, $.tag)
        ),
        repeat(prec.left($._expression))
      ),

    october_tag: () =>
      alias(
        choice(
          'page',
          'partial',
          'content',
          'component',
          'placeholder',
          'endplaceholder',
          'scripts',
          'styles',
          'flash',
          'endflash',
          'verbatim',
          'endverbatim',
          'framework',
          'put',
          'endput',
          'default',
          'enddefault'
        ),
        'october_tag'
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
      seq(
        choice($.october_function, alias($.identifier, $.function_identifier)),
        $.arguments
      ),

    october_function: () =>
      alias(
        choice(
          'abort',
          'redirect',
          'dump',
          'str',
          'form',
          'html',
          'config',
          'env',
          'session',
          'trans',
          'input'
        ),
        'october_function'
      ),

    arguments: ($) =>
      seq('(', optional(seq($.argument, repeat(seq(',', $.argument)))), ')'),

    argument: ($) =>
      seq(optional($.argument_name), alias($._expression, $.argument_value)),

    argument_name: () => seq(REGEX_NAME, '='),

    filter: ($) =>
      prec.left(
        seq(
          choice($.october_filter, alias($.identifier, $.filter_identifier)),
          optional(alias($.filter_arguments, $.arguments))
        )
      ),

    october_filter: () =>
      alias(
        choice(
          'app',
          'page',
          'theme',
          'media',
          'resize',
          'md',
          'markdown'
        ),
        'october_filter'
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

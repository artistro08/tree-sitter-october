; ===== October CMS Sections =====

; Section delimiter (==)
(section_delimiter) @punctuation.special

; INI Configuration Section
(ini_section_header) @type
(ini_setting) @property

; PHP Code Section
(php_code) @embedded

; ===== Twig Syntax =====

(comment) @comment

(filter_identifier) @function.call
(function_identifier) @function.call
(test) @function.builtin
(variable) @variable
(string) @string
(interpolated_string) @string
(operator) @operator
(number) @number
(boolean) @constant.builtin
(null) @constant.builtin
(keyword) @keyword
(attribute) @attribute
(tag) @tag
(conditional) @conditional
(repeat) @repeat
(method) @method
(parameter) @parameter

[
    "{{"
    "}}"
    "{{-"
    "-}}"
    "{{~"
    "~}}"
    "{%"
    "%}"
    "{%-"
    "-%}"
    "{%~"
    "~%}"
] @tag.delimiter

[
    ","
    "."
    "?"
    ":"
    "="
] @punctuation.delimiter

(interpolated_string [
    "#{" 
    "}"
] @punctuation.delimiter)

[
    "("
    ")"
    "["
    "]"
    "{"
] @punctuation.bracket

(hash [
    "}"
] @punctuation.bracket)

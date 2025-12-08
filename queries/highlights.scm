; Highlights for October CMS Twig

; ============================================================================
; Configuration Section (INI)
; ============================================================================

; INI comments
(ini_comment) @comment

; INI section headers
(ini_section_header
  "[" @punctuation.bracket
  (ini_section_name) @type
  "]" @punctuation.bracket)

; INI properties
(ini_property
  (ini_key) @property
  "=" @operator
  (ini_value) @string)

; ============================================================================
; PHP Section
; ============================================================================

; PHP tags
(php_open_tag) @tag
(php_close_tag) @tag

; PHP content is handled via injections.scm for proper syntax highlighting

; ============================================================================
; Markup Section (Twig)
; ============================================================================

; Comments
(comment) @comment

; October CMS specific tags
(october_tag) @keyword

; Keywords
(keyword) @keyword
(conditional) @keyword.conditional
(repeat) @keyword.repeat

; Tags
(tag) @tag

; Variables
(variable) @variable

; Operators
(operator) @operator

; Functions
(october_function) @function.builtin
(function_identifier) @function

; Filters
(october_filter) @function.builtin
(filter_identifier) @function

; Strings
(string) @string
(interpolated_string) @string

; Numbers
(number) @number

; Booleans
(boolean) @boolean

; Null
(null) @constant.builtin

; Methods
(method) @method

; Parameters
(parameter) @parameter

; Attributes
(attribute) @attribute

; Directives
"{%" @punctuation.bracket
"%}" @punctuation.bracket
"{{" @punctuation.bracket
"}}" @punctuation.bracket

; Punctuation
"," @punctuation.delimiter
":" @punctuation.delimiter
"." @punctuation.delimiter
"|" @punctuation.special

; Brackets
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

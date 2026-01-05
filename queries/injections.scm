; PHP code injection - inject the whole php_code node (includes tags as children)
; Using both standard and Zed shorthand syntax
((php_code) @injection.content
  (#set! injection.language "php"))

((php_code) @content
  (#set! language "php"))

; HTML content in Twig section - using both syntaxes
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

((content) @content
 (#set! language "html")
 (#set! combined))

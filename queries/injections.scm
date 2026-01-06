; PHP code injection - php_code is now a leaf token (no children) for Zed injection
; Zed only applies injections to nodes without child nodes
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

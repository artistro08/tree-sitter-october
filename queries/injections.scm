; PHP code section injection
((php_code) @injection.content
  (#set! injection.language "php")
  (#set! injection.combined))

; HTML content in Twig section
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

((style_content) @injection.content
  (#set! injection.language "css")
  (#set! injection.combined))

((js_content) @injection.content
  (#set! injection.language "javascript")
  (#set! injection.combined))

((json_content) @injection.content
  (#set! injection.language "json")
  (#set! injection.combined))

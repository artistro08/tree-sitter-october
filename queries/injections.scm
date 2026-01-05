; PHP code injection - php_code is a raw text token like HTML's raw_text
((php_code) @injection.content
  (#set! injection.language "php"))

; HTML content in Twig section
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

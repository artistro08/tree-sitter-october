; PHP section injection - inject entire section including <?php tags
((php_section) @injection.content
  (#set! injection.language "php")
  (#set! injection.combined))

; HTML content in Twig section
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

; PHP code injection - php_code node now includes <?php tags
((php_code) @injection.content
  (#set! injection.language "php")
  (#set! injection.include-children))

; HTML content in Twig section
((content) @injection.content
 (#set! injection.language "html")
 (#set! injection.combined))

; Inject PHP grammar into php_content nodes
((php_content) @injection.content
  (#set! injection.language "php")
  (#set! injection.include-children))

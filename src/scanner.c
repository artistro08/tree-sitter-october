#include "tree_sitter/parser.h"
#include <ctype.h>
#include <wctype.h>

enum TokenType {
  CONTENT
};

void *tree_sitter_october_external_scanner_create() { return NULL; }
void tree_sitter_october_external_scanner_destroy(void *p) {}
void tree_sitter_october_external_scanner_reset(void *p) {}
unsigned tree_sitter_october_external_scanner_serialize(void *p, char *buffer) { return 0; }
void tree_sitter_october_external_scanner_deserialize(void *p, const char *b, unsigned n) {}

static void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

bool tree_sitter_october_external_scanner_scan(void *payload, TSLexer *lexer,
                                                const bool *valid_symbols) {
  if (valid_symbols[CONTENT]) {
    bool has_content = false;
    bool at_line_start = lexer->get_column(lexer) == 0;

    while (true) {
      // Don't match content at the start of lines that might be INI config
      if (at_line_start && (isalpha(lexer->lookahead) || lexer->lookahead == '[')) {
        // Might be INI section header or key
        break;
      }

      // Don't match section separators
      if (lexer->lookahead == '=' && at_line_start) {
        break;
      }

      // Check for Twig delimiters
      if (lexer->lookahead == '{') {
        lexer->mark_end(lexer);
        advance(lexer);
        if (lexer->lookahead == '{' || lexer->lookahead == '%' || lexer->lookahead == '#') {
          // Found a Twig delimiter, stop here
          break;
        }
        has_content = true;
        at_line_start = false;
        continue;
      }

      // Check for end of file
      if (lexer->lookahead == 0) {
        lexer->mark_end(lexer);
        break;
      }

      //  Update line start tracking
      if (lexer->lookahead == '\n') {
        at_line_start = true;
        has_content = true;
        advance(lexer);
        continue;
      }

      // Consume regular content
      has_content = true;
      at_line_start = false;
      advance(lexer);
    }

    if (has_content) {
      lexer->result_symbol = CONTENT;
      return true;
    }
  }

  return false;
}

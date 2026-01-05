#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  SECTION_DELIMITER
};

void *tree_sitter_october_external_scanner_create() {
  return NULL;
}

void tree_sitter_october_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_october_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_october_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

static void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

// Check if we're at a section delimiter (==)
static bool scan_section_delimiter(TSLexer *lexer) {
  // Skip any leading whitespace/newlines
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t' ||
         lexer->lookahead == '\n' || lexer->lookahead == '\r') {
    advance(lexer);
  }

  // Must start with at least two equals signs
  if (lexer->lookahead != '=') return false;
  advance(lexer);

  if (lexer->lookahead != '=') return false;
  advance(lexer);

  // Consume any additional equals signs
  while (lexer->lookahead == '=') {
    advance(lexer);
  }

  // Skip trailing spaces and tabs (but not newlines yet)
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
    advance(lexer);
  }

  // Must be followed by newline, carriage return, or EOF
  if (lexer->lookahead == '\n' || lexer->lookahead == '\r' || lexer->eof(lexer)) {
    lexer->result_symbol = SECTION_DELIMITER;
    lexer->mark_end(lexer);
    return true;
  }

  return false;
}

bool tree_sitter_october_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  // Only scan for section delimiter
  if (valid_symbols[SECTION_DELIMITER]) {
    return scan_section_delimiter(lexer);
  }

  return false;
}

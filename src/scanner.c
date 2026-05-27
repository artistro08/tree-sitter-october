#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  SEPARATOR,
  CHUNK
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

// Matches a section separator: "==" or longer run of "=" at the start of a
// line, followed by optional spaces/tabs and a newline (or EOF).
// Must begin in column 0 - no leading whitespace tolerated, to keep agreement
// with the chunk scanner.
static bool scan_separator(TSLexer *lexer) {
  if (lexer->lookahead != '=') return false;
  advance(lexer);
  if (lexer->lookahead != '=') return false;
  advance(lexer);
  while (lexer->lookahead == '=') advance(lexer);
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') advance(lexer);
  if (lexer->lookahead == '\r') advance(lexer);
  if (lexer->lookahead == '\n') {
    advance(lexer);
  } else if (!lexer->eof(lexer)) {
    return false;
  }
  lexer->mark_end(lexer);
  lexer->result_symbol = SEPARATOR;
  return true;
}

// Consume opaque section content. Stops at the start of a line that begins
// with "==" (a separator), or at EOF. Token must be non-empty.
static bool scan_chunk(TSLexer *lexer) {
  bool consumed = false;
  bool at_line_start = true;  // we are at column 0 when scanner is first called for a chunk

  for (;;) {
    if (at_line_start && lexer->lookahead == '=') {
      // Potential separator coming up - do not consume.
      if (!consumed) return false;
      lexer->result_symbol = CHUNK;
      return true;
    }

    if (lexer->eof(lexer)) break;

    int32_t c = lexer->lookahead;
    advance(lexer);
    consumed = true;

    if (c == '\n') {
      lexer->mark_end(lexer);
      at_line_start = true;
    } else if (c != '\r') {
      at_line_start = false;
    }
  }

  if (consumed) {
    lexer->mark_end(lexer);
    lexer->result_symbol = CHUNK;
    return true;
  }
  return false;
}

bool tree_sitter_october_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  // Separator has priority over chunk so empty sections (== immediately
  // followed by ==) parse correctly.
  if (valid_symbols[SEPARATOR] && scan_separator(lexer)) {
    return true;
  }
  if (valid_symbols[CHUNK]) {
    return scan_chunk(lexer);
  }
  return false;
}

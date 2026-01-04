VERSION := 0.1.0

.PHONY: all install generate build test clean

all: generate

install:
	npm install

generate:
	tree-sitter generate

build:
	tree-sitter build

test:
	tree-sitter test

parse:
	tree-sitter parse examples/*.htm

clean:
	rm -rf build node_modules
	cargo clean

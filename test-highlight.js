const Parser = require('tree-sitter');
const October = require('./bindings/node');
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(October);

// Read the config-only example
const sourceCode = fs.readFileSync('examples/config-only.htm', 'utf8');

// Parse the source code
const tree = parser.parse(sourceCode);

// Print the tree
console.log('Parse Tree:');
console.log(tree.rootNode.toString());

// Get all node types in the tree
function collectNodeTypes(node, types = new Set()) {
  types.add(node.type);
  for (let i = 0; i < node.childCount; i++) {
    collectNodeTypes(node.child(i), types);
  }
  return types;
}

const nodeTypes = collectNodeTypes(tree.rootNode);
console.log('\nAll node types found:');
console.log([...nodeTypes].sort().join('\n'));

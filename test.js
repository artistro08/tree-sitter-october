const Parser = require('tree-sitter');
const October = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(October.language);

const sourceCode = `
{% page %}
<h1>{{ title|app }}</h1>
{% component 'blogPosts' %}

{% for post in posts %}
    <h2>{{ post.title }}</h2>
    <img src="{{ post.image|media|resize(800, 600) }}">
{% endfor %}

{% partial 'footer' %}
`;

console.log('Testing October CMS Twig parser...\n');
const tree = parser.parse(sourceCode);
console.log('✓ Parser loaded successfully!');
console.log('✓ Code parsed successfully!');
console.log('\nSyntax tree:');
console.log(tree.rootNode.toString());

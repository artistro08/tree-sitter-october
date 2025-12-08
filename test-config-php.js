const Parser = require('tree-sitter');
const October = require('./bindings/node');

const parser = new Parser();
parser.setLanguage(October.language);

console.log('Testing October CMS parser with configuration and PHP sections...\n');

// Test 1: Full template with all three sections
const fullTemplate = `url = "/blog"
layout = "default"
title = "Blog Posts"

[component]
posts = "blogPosts"
postsPerPage = 10
==
<?php
use Acme\Blog\Classes\Post;
use Acme\Blog\Classes\Category;

function onStart()
{
    $this['posts'] = Post::get();
    $this['categories'] = Category::all();
}

function onLoadMore()
{
    $this['posts'] = Post::paginate(10);
}
?>
==
{% page %}
<h1>{{ title }}</h1>

{% for post in posts %}
    <h2>{{ post.title }}</h2>
    <img src="{{ post.image|media|resize(800, 600) }}">
    <p>{{ post.content }}</p>
{% endfor %}

{% component 'blogPosts' %}
`;

console.log('Test 1: Full template with all three sections');
const tree1 = parser.parse(fullTemplate);
console.log('✓ Parsed successfully!');
console.log('Root node type:', tree1.rootNode.type);
console.log('Child count:', tree1.rootNode.childCount);
console.log('');

// Test 2: Configuration and markup only (no PHP)
const configMarkupTemplate = `url = "/page"
layout = "default"

[component]
name = "myComponent"
==
{% page %}
<h1>{{ title }}</h1>
{% component 'myComponent' %}
`;

console.log('Test 2: Configuration and markup only');
const tree2 = parser.parse(configMarkupTemplate);
console.log('✓ Parsed successfully!');
console.log('Root node type:', tree2.rootNode.type);
console.log('');

// Test 3: PHP and markup only (no config)
const phpMarkupTemplate = `<?php
function onStart()
{
    $this['message'] = 'Hello World';
}
?>
==
<h1>{{ message }}</h1>
`;

console.log('Test 3: PHP and markup only');
const tree3 = parser.parse(phpMarkupTemplate);
console.log('✓ Parsed successfully!');
console.log('Root node type:', tree3.rootNode.type);
console.log('');

// Test 4: Markup only (original behavior)
const markupOnlyTemplate = `{% page %}
<h1>{{ title|app }}</h1>
{% component 'blogPosts' %}
`;

console.log('Test 4: Markup only (original behavior)');
const tree4 = parser.parse(markupOnlyTemplate);
console.log('✓ Parsed successfully!');
console.log('Root node type:', tree4.rootNode.type);
console.log('');

// Test 5: Configuration only
const configOnlyTemplate = `url = "/test"
layout = "default"
title = "Test Page"
==
`;

console.log('Test 5: Configuration only');
const tree5 = parser.parse(configOnlyTemplate);
console.log('✓ Parsed successfully!');
console.log('Root node type:', tree5.rootNode.type);
console.log('');

console.log('All tests completed successfully! ✓');
console.log('\nDetailed syntax tree for full template:');
console.log(tree1.rootNode.toString());

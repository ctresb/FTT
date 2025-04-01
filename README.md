# FTT (Flat Text Tags)
![FTT logo](https://f.feridinha.com/2OsR2.png)

FTT is a lightweight JavaScript engine designed to convert a simple, custom plain text markup into styled HTML.

## Motivation

This project was born out of the struggle to find a straightforward blogging or content management solution. While Markdown is powerful, integrating it seamlessly, especially when dealing with JSON data structures or complex build steps, felt cumbersome for simple use cases. FTT aims to provide a direct, easy-to-understand way to write formatted text that translates directly into HTML with predefined CSS classes (prefixed with `ftt-`), simplifying content creation.

## How it Works

FTT uses a JavaScript class (`FTT`) that parses text containing specific tags. It processes these tags, converting them into corresponding HTML elements with specific CSS classes. This allows you to write content naturally in a text file or textarea and get styled HTML output ready for display. The engine processes tags iteratively, handling nested inline styles and ensuring RAW content is preserved until the end.

## Supported Tags

FTT recognizes the following tags:

| Tag Syntax                 | Generated HTML                                                               | CSS Class      | Description                                                                   |
| :------------------------- | :--------------------------------------------------------------------------- | :------------- | :---------------------------------------------------------------------------- |
| `[T]Content[/T]`           | `<h1 class="ftt-title">Content</h1>`                                         | `ftt-title`    | Main title (H1)                                                               |
| `[S]Content[/S]`           | `<h2 class="ftt-subtitle">Content</h2>`                                      | `ftt-subtitle` | Subtitle (H2)                                                                 |
| `[P]Content[/P]`           | `<p class="ftt-paragraph">Content</p>`                                       | `ftt-paragraph`| Standard paragraph                                                            |
| `[Q]Content[/Q]`           | `<blockquote class="ftt-quote">Content</blockquote>`                           | `ftt-quote`    | Blockquote for quoted text                                                    |
| `[B]Content[/B]`           | `<strong class="ftt-bold">Content</strong>`                                  | `ftt-bold`     | Bold text                                                                     |
| `[I]Content[/I]`           | `<em class="ftt-italic">Content</em>`                                        | `ftt-italic`   | Italicized text                                                               |
| `[IMG(URL){Alt Text}]`     | `<img class="ftt-image" src="URL" alt="Alt Text">`                            | `ftt-image`    | Image element                                                                 |
| `[LINK(URL){Link Text}]`   | `<a href="URL" target="_blank" rel="noopener noreferrer" class="ftt-link">Link Text</a>` | `ftt-link`     | Hyperlink (opens in new tab)                                                  |
| `[BR/]`                    | `<br>`                                                                       | N/A            | Line break                                                                    |
| `[RAW]Content[/RAW]`       | `<pre class="ftt-raw">Escaped Content</pre>`                                  | `ftt-raw`      | Displays content literally, preserving whitespace and escaping HTML entities. |

**Nesting:** Simple inline tags like `[B]` and `[I]` can be nested (e.g., `[B]This is also [I]italic[/I][/B]`). Links and images can appear within paragraphs, quotes, etc.

**RAW Tag:** The `[RAW]...[/RAW]` tag is special. Its content is ignored by the FTT parser during the main conversion process. At the very end, the original content inside `[RAW]` is retrieved, HTML-escaped (to prevent accidental code injection), and wrapped in a `<pre class="ftt-raw">` tag. This is ideal for displaying code examples or showing FTT syntax itself without it being processed.

## How to Use

1.  **Include the Script:** Add the `ftt.js` file to your project.
    ```html
    <script src="ftt.js"></script>
    ```

2.  **Instantiate the Engine:** Create an instance of the class in your JavaScript.
    ```javascript
    const ftt = new FTT();
    ```

3.  **Convert Text:** Pass your FTT-formatted text string to the `convertToHtml` method.
    ```javascript
    const myFttText = `[T]My Awesome Post[/T]
[BR/]
[P]This is the first paragraph with a [LINK(https://example.com){link}] and some [B]bold text[/B].[/P]
[BR/]
[IMG(path/to/image.jpg){A descriptive alt text}]
[BR/]
[P]Use RAW to show code:[/P]
[RAW][P]This paragraph tag [B]will not[/B] be converted.[/P]
function hello() { console.log("Hi!"); }[/RAW]`;

    const generatedHtml = ftt.convertToHtml(myFttText);

    // Now 'generatedHtml' contains the HTML string:
    // <h1 class="ftt-title">My Awesome Post</h1><br><p class="ftt-paragraph">This is the first paragraph with a <a href="https://example.com" target="_blank" rel="noopener noreferrer" class="ftt-link">link</a> and some <strong class="ftt-bold">bold text</strong>.</p><br><img class="ftt-image" src="path/to/image.jpg" alt="A descriptive alt text"><br><p class="ftt-paragraph">Use RAW to show code:</p><pre class="ftt-raw"><P>This paragraph tag <B>will not</B> be converted.</P>\nfunction hello() { console.log("Hi!"); }</pre>

    // You can then inject this HTML into your page, e.g.:
    // document.getElementById('content-area').innerHTML = generatedHtml;
    ```

4.  **Add CSS:** The engine only generates the HTML structure with classes. You need to provide your own CSS rules to style the `ftt-*` classes (e.g., `ftt-title`, `ftt-paragraph`, `ftt-link`, `ftt-raw`, etc.) according to your design.

That's it! FTT provides a simple layer between plain text writing and styled HTML output.

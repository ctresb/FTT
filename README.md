# FTT (Flat Text Tags)
![FTT logo](https://f.feridinha.com/2OsR2.png)

FTT is a lightweight JavaScript engine designed to convert a simple, custom plain text markup into styled HTML.

## Motivation

This project was born out of the struggle to find a straightforward blogging or content management solution. While Markdown is powerful, integrating it seamlessly, especially when dealing with JSON data structures or complex build steps, felt cumbersome for simple use cases. FTT aims to provide a direct, easy-to-understand way to write formatted text that translates directly into HTML with predefined CSS classes, simplifying content creation.

## How it Works

FTT uses a JavaScript class (`FTT`) that parses text containing specific tags. It processes these tags, converting them into corresponding HTML elements with specific CSS classes. This allows you to write content naturally in a text file or textarea and get styled HTML output ready for display.

## Supported Tags

FTT recognizes the following tags:

| Tag Syntax                | Generated HTML                                                               | CSS Class     | Description                               |
| :------------------------ | :--------------------------------------------------------------------------- | :------------ | :---------------------------------------- |
| `[TITLE](Content)`        | `<h1 class="ste-title">Content</h1>`                                         | `ste-title`   | Main title                              |
| `[SUBTITLE](Content)`     | `<h2 class="ste-subtitle">Content</h2>`                                      | `ste-subtitle`| Subtitle                                  |
| `[PARAGRAPH](Content)`    | `<p class="ste-paragraph">Content</p>`                                       | `ste-paragraph`| Standard paragraph                       |
| `[IMAGE](URL){Alt Text}`  | `<img class="ste-image" src="URL" alt="Alt Text">`                            | `ste-image`   | Image element                             |
| `[LINK](URL){Link Text}`  | `<a href="URL" target="_blank" rel="noopener noreferrer" class="ste-link">Link Text</a>` | `ste-link`    | Hyperlink (opens in new tab)              |
| `[BOLD](Content)`         | `<strong class="ste-bold">Content</strong>`                                  | `ste-bold`    | Bold text                                 |
| `[ITALIC](Content)`       | `<em class="ste-italic">Content</em>`                                        | `ste-italic`  | Italicized text                           |
| `[QUOTE](Content)`        | `<blockquote class="ste-quote">Content</blockquote>`                           | `ste-quote`   | Blockquote for quoted text              |
| `[BRK]`                   | `<br>`                                                                       | N/A           | Line break                                |

**Nesting:** Simple inline tags like `[BOLD]` and `[ITALIC]` can be nested (e.g., `[BOLD](This is also [ITALIC](italic))`). Links and images can appear within paragraphs, quotes, etc.

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
    const myFttText = `[TITLE](My Awesome Post)
    [BRK]
    [PARAGRAPH](This is the first paragraph with a [LINK](https://example.com){link} and some [BOLD](bold text).)
    [BRK]
    [IMAGE](path/to/image.jpg){A descriptive alt text}`;

    const generatedHtml = fttEngine.convertToHtml(myFttText);

    // Now 'generatedHtml' contains the HTML string:
    // <h1 class="ste-title">My Awesome Post</h1><br><p class="ste-paragraph">This is the first paragraph with a <a href="https://example.com" target="_blank" rel="noopener noreferrer" class="ste-link">link</a> and some <strong class="ste-bold">bold text</strong>.</p><br><img class="ste-image" src="path/to/image.jpg" alt="A descriptive alt text">

    // You can then inject this HTML into your page, e.g.:
    // document.getElementById('content-area').innerHTML = generatedHtml;
    ```

4.  **Add CSS:** The engine only generates the HTML structure with classes. You need to provide your own CSS rules to style the `ste-*` classes (e.g., `ste-title`, `ste-paragraph`, `ste-link`, etc.) according to your design.

That's it! FTT provides a simple layer between plain text writing and styled HTML output.

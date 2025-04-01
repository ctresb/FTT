# FTT (Flat Text Tags)

[![npm version](https://img.shields.io/npm/v/flat-text-tags.svg)](https://www.npmjs.com/package/flat-text-tags)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Optional: Add build status, coverage badges if applicable -->

![FTT logo](https://f.feridinha.com/2OsR2.png)

FTT is a lightweight, configurable JavaScript engine designed to convert a simple, custom plain text markup into styled HTML, extract metadata, and handle basic localization.

## Motivation

This project was born out of the struggle to find a straightforward blogging or content management solution. While Markdown is powerful, integrating it seamlessly, especially when dealing with JSON data structures or complex build steps, felt cumbersome for simple use cases. FTT aims to provide a direct, easy-to-understand way to write formatted text that translates directly into HTML with predefined (and customizable) CSS classes, simplifying content creation and management.

## How it Works

FTT uses a JavaScript class (`FTT`) that parses text containing specific tags. The process involves several steps:

1.  **RAW Content Extraction:** Content within `[RAW]...[/RAW]` tags is temporarily replaced with placeholders. This preserves the original content, preventing it from being parsed by subsequent steps.
2.  **Configuration & Metadata Extraction:** Tags like `[CONFIG(key){value}]`, `[KEYWORDS]...[/KEYWORDS]`, `[CATEGORY]...[/CATEGORY]`, and `[SLUG]...[/SLUG]` are processed. Their content is extracted and stored internally, and the tags are removed from the text. Configuration values (like `lang`) can influence later processing steps.
3.  **Localization (`[LOC]`) Processing:** Content within `[LOC(langCode)]...[/LOC]` tags is conditionally kept or removed based on the currently configured language (`lang`, defaulting to `en` or set via `[CONFIG(lang){...}]`).
4.  **Content Tag Conversion:** The remaining text is iteratively processed.
    *   Special tags like `[IMG(...){...}]`, `[BANNER(...){...}]`, `[LINK(...){...}]`, `[TIMESTAMP(...){...}]`, `[AUTHOR(...){...}]`, and `[COLOR(...)]...[/COLOR]` are converted into their respective HTML elements with appropriate attributes and classes. Sanitization is applied to URLs, alt text, and color values for security and robustness.
    *   Paired formatting tags (like `[T]`, `[P]`, `[B]`, `[H1]`, etc.) are converted into their corresponding HTML elements (e.g., `<h1>`, `<p>`, `<strong>`). Nesting of inline tags is supported.
    *   Self-closing tags like `[BR/]` are converted (e.g., `<br>`).
5.  **RAW Content Restoration:** The placeholders for `[RAW]` content are replaced with the original content, which is HTML-escaped and wrapped in `<pre>` tags.

The final output is a clean HTML string, along with accessible metadata and configuration values extracted from the text.

## Features

*   **Simple Tag Syntax:** Easy-to-learn BBCode-like syntax.
*   **HTML Conversion:** Translates tags into standard HTML elements.
*   **CSS Classes:** Automatically adds configurable CSS classes (default prefix `ftt-`) for styling.
*   **Metadata Extraction:** Pulls out `KEYWORDS`, `CATEGORY`, and `SLUG` information.
*   **Inline Configuration:** Set processing options like language (`lang`) directly within the text using `[CONFIG(key){value}]`.
*   **Localization:** Conditionally display content based on language using `[LOC(langCode)]...[/LOC]`.
*   **Special Elements:** Built-in support for images, links, banners, timestamps (with formatting), author tags (with optional links), and inline color styling.
*   **RAW Content:** Preserve and display code or preformatted text safely using `[RAW]...[/RAW]`.
*   **Configurable:** Customize tag mappings, CSS classes, and engine behavior via the constructor.
*   **Sanitization:** Basic sanitization for URLs, attributes, and colors to prevent common issues.
*   **Modular Design:** Core logic separated into classes (`FttConfig`, `FttRegex`, `FttSanitizer`, `FttRawContentHandler`, `FTT`).

## Supported Tags

FTT recognizes the following tags by default. Many of these can be customized via configuration.

| Tag Syntax                      | Type          | Generated HTML / Behavior                                                               | Default CSS Class | Description                                                                              |
| :------------------------------ | :------------ | :-------------------------------------------------------------------------------------- | :---------------- | :--------------------------------------------------------------------------------------- |
| **Content Formatting**          |               |                                                                                         |                   |                                                                                          |
| `[T]Content[/T]`                | Content       | `<h1 class="ftt-title">Content</h1>`                                                    | `ftt-title`       | Main title (H1)                                                                          |
| `[S]Content[/S]`                | Content       | `<h2 class="ftt-subtitle">Content</h2>`                                                 | `ftt-subtitle`    | Subtitle (H2)                                                                          |
| `[P]Content[/P]`                | Content       | `<p class="ftt-paragraph">Content</p>`                                                  | `ftt-paragraph`   | Standard paragraph                                                                       |
| `[Q]Content[/Q]`                | Content       | `<blockquote class="ftt-quote">Content</blockquote>`                                      | `ftt-quote`       | Blockquote for quoted text                                                               |
| `[B]Content[/B]`                | Content       | `<strong class="ftt-bold">Content</strong>`                                             | `ftt-bold`        | Bold text                                                                                |
| `[I]Content[/I]`                | Content       | `<em class="ftt-italic">Content</em>`                                                   | `ftt-italic`      | Italicized text                                                                          |
| `[H1]Content[/H1]`              | Content       | `<h1>Content</h1>`                                                                       | *(none)*          | Heading level 1                                                                          |
| `[H2]Content[/H2]`              | Content       | `<h2>Content</h2>`                                                                       | *(none)*          | Heading level 2                                                                          |
| `[H3]Content[/H3]`              | Content       | `<h3>Content</h3>`                                                                       | *(none)*          | Heading level 3                                                                          |
| `[H4]Content[/H4]`              | Content       | `<h4>Content</h4>`                                                                       | *(none)*          | Heading level 4                                                                          |
| `[H5]Content[/H5]`              | Content       | `<h5>Content</h5>`                                                                       | *(none)*          | Heading level 5                                                                          |
| `[H6]Content[/H6]`              | Content       | `<h6>Content</h6>`                                                                       | *(none)*          | Heading level 6                                                                          |
| `[BR/]`                         | Content       | `<br>`                                                                                  | N/A               | Line break                                                                               |
| **Special Elements**            |               |                                                                                         |                   |                                                                                          |
| `[IMG(URL){Alt Text}]`          | Special       | `<img class="ftt-image" src="URL" alt="Alt Text">`                                       | `ftt-image`       | Image element (URL/Alt sanitized)                                                        |
| `[BANNER(URL){Alt Text}]`       | Special       | `<img class="ftt-banner" src="URL" alt="Alt Text">`                                      | `ftt-banner`      | Banner image (like IMG, different class)                                                 |
| `[LINK(URL){Link Text}]`        | Special       | `<a href="URL" target="_blank" rel="noopener noreferrer" class="ftt-link">Link Text</a>` | `ftt-link`        | Hyperlink (opens in new tab, URL/Text sanitized)                                         |
| `[TIMESTAMP(ISO){Format}]`      | Special       | `<time class="ftt-timestamp" datetime="ISO">Formatted Text</time>`                      | `ftt-timestamp`   | Displays a timestamp. `ISO` is ISO 8601 string. `Format` (optional) like `yyyy-MM-dd`. |
| `[AUTHOR(Name){URL}]`           | Special       | `<span class="ftt-author"><a href="URL">Name</a></span>` or `<span class="ftt-author">Name</span>` | `ftt-author`      | Author information, optionally linked (URL/Name sanitized).                               |
| `[COLOR(fg,bg)]Content[/COLOR]` | Special       | `<span style="color:fg; background-color:bg;">Content</span>`                           | *(inline style)*  | Applies inline text color (`fg`) and optional background color (`bg`). Colors sanitized. |
| **Metadata & Configuration**    |               |                                                                                         |                   |                                                                                          |
| `[KEYWORDS]Terms[/KEYWORDS]`    | Metadata      | *Extracted*, tag removed. Access via `getTagContent('KEYWORDS')`.                       | N/A               | Comma-separated keywords or phrases.                                                     |
| `[CATEGORY]Name[/CATEGORY]`     | Metadata      | *Extracted*, tag removed. Access via `getTagContent('CATEGORY')`.                       | N/A               | Content category.                                                                        |
| `[SLUG]url-slug[/SLUG]`         | Metadata      | *Extracted*, tag removed. Access via `getTagContent('SLUG')`.                           | N/A               | URL-friendly slug.                                                                       |
| `[CONFIG(key){value}]`          | Configuration | *Extracted*, tag removed. Access via `getConfigValue('key')`. Affects processing.       | N/A               | Sets internal config (e.g., `[CONFIG(lang){fr}]`).                                       |
| **Localization & RAW**          |               |                                                                                         |                   |                                                                                          |
| `[LOC(lang)]Content[/LOC]`      | Special       | Content processed/output only if `lang` matches current language config.                | N/A               | Language-specific content block.                                                         |
| `[RAW]Content[/RAW]`            | Special       | `<pre class="ftt-raw">Escaped Content</pre>`                                             | `ftt-raw`         | Displays content literally, preserves whitespace, escapes HTML. Ideal for code.          |

**Nesting:**
*   Inline tags like `[B]` and `[I]` can be nested within each other and within block tags like `[P]`, `[Q]`, `[T]`, etc. (`[P]Some [B]bold and [I]italic[/I][/B] text.[/P]`).
*   `[LINK]`, `[IMG]`, `[BANNER]`, `[TIMESTAMP]`, `[AUTHOR]`, `[COLOR]` can generally be used within block tags.
*   `[RAW]` content is treated as opaque; no FTT tags inside it will be processed.
*   `[LOC]` tags can contain other FTT tags, which are only processed if the language matches.
*   Nesting block tags (like `[P]` inside `[P]`) might produce invalid HTML and should generally be avoided unless custom tags/styling handle it.

**RAW Tag:** The `[RAW]...[/RAW]` tag is special. Its content is ignored by the FTT parser during the main conversion process. At the very end, the original content inside `[RAW]` is retrieved, HTML-escaped (to prevent accidental code injection), and wrapped in a `<pre class="ftt-raw">` tag. This is ideal for displaying code examples or showing FTT syntax itself without it being processed.

## How to Use

1.  **Install (Optional, if using npm):**
    ```bash
    npm install flat-text-tags
    ```
    Then import:
    ```javascript
    import { FTT } from 'flat-text-tags';
    // Or if using CommonJS: const { FTT } = require('flat-text-tags');
    ```

2.  **Include the Script (if not using npm):** Download `ftt.js` and include it in your HTML.
    ```html
    <script src="path/to/ftt.js"></script>
    <!-- The FTT class will be available globally -->
    ```

3.  **Instantiate the Engine:** Create an instance of the class in your JavaScript. You can optionally pass a configuration object.
    ```javascript
    // Default configuration
    const ftt = new FTT();

    // --- OR ---

    // With custom configuration
    const customConfig = {
        // Change the class for paragraphs
        tags: {
            P: { tag: 'p', class: 'my-custom-paragraph-class' },
            // Add a new tag [NOTE]...[/NOTE]
            NOTE: { tag: 'div', class: 'ftt-note' }
        },
        // Change the default image class
        imgClass: 'img-responsive',
        // Disable warnings in console
        enableWarnings: false,
        // Set default language for [LOC] tags
        defaultLang: 'es'
    };
    const customFtt = new FTT(customConfig);
    ```

4.  **Convert Text:** Pass your FTT-formatted text string to the `convertToHtml` method.
    ```javascript
    const myFttText = `
    [CONFIG(lang){en}]
    [KEYWORDS]javascript, html, parser, ftt[/KEYWORDS]
    [CATEGORY]Web Development[/CATEGORY]
    [SLUG]my-awesome-post-2024[/SLUG]

    [T]My Awesome Post[/T]
    [AUTHOR(Alice){https://example.com/alice}] - [TIMESTAMP(2024-03-15T10:30:00){yyyy-MM-dd hh:mm}]

    [P]This is the first paragraph. It supports [B]bold[/B] and [I]italic[/I] text, as well as [LINK(https://example.com){links}].[/P]

    [P]
    [LOC(en)]
    This content is only shown in English.
    [/LOC]
    [LOC(fr)]
    Ce contenu n'est affiché qu'en français.
    [/LOC]
    [/P]

    [BANNER(path/to/banner.jpg){Post Banner}]

    [S]Features[/S]
    [P]Including images: [IMG(path/to/image.jpg){A descriptive alt text}] and quotes:[/P]
    [Q]This is a blockquote.[/Q]
    [P]You can add [COLOR(#ff0000)]red text[/COLOR] or [COLOR(blue, yellow)]blue text on yellow background[/COLOR].[/P]
    [BR/]
    [P]Use RAW to show code safely:[/P]
    [RAW][P]This paragraph tag [B]will not[/B] be converted.[/P]
    function hello() {
    console.log("Hi!");
    }[/RAW]`;

    const ftt = new FTT(); // Or use customFtt if configured
    const generatedHtml = ftt.convertToHtml(myFttText);

    // 'generatedHtml' now contains the HTML string. Example snippet:
    // <h1 class="ftt-title">My Awesome Post</h1><span class="ftt-author"><a href="https://example.com/alice" target="_blank" rel="noopener noreferrer">Alice</a></span> - <time class="ftt-timestamp" datetime="2024-03-15T10:30:00">2024-03-15 10:30</time>...<p class="ftt-paragraph">This content is only shown in English.</p>...<pre class="ftt-raw"><P>This paragraph tag <B>will not</B> be converted.</P>\nfunction hello() {\n  console.log("Hi!");\n}</pre>

    // Inject the HTML into your page:
    // document.getElementById('content-area').innerHTML = generatedHtml;

    // Access extracted metadata and config:
    const keywords = ftt.getTagContent('KEYWORDS'); // "javascript, html, parser, ftt"
    const category = ftt.getTagContent('CATEGORY'); // "Web Development"
    const slug = ftt.getTagContent('SLUG');         // "my-awesome-post-2024"
    const lang = ftt.getConfigValue('lang');       // "en"

    console.log("Keywords:", keywords);
    console.log("Language:", lang);

    const allMeta = ftt.getAllMetadata(); // {KEYWORDS: '...', CATEGORY: '...', SLUG: '...'}
    const allConfig = ftt.getAllConfigValues(); // {lang: 'en'}
    ```

5.  **Add CSS:** The engine generates HTML structure with classes (mostly prefixed with `ftt-` by default). You **must** provide your own CSS rules to style these classes according to your design.
    ```css
    /* Example CSS */
    .ftt-title {
      font-size: 2.5em;
      color: #333;
      margin-bottom: 0.5em;
    }
    .ftt-subtitle {
      font-size: 1.8em;
      color: #555;
      margin-bottom: 0.8em;
    }
    .ftt-paragraph {
      line-height: 1.6;
      margin-bottom: 1em;
    }
    .ftt-link {
      color: blue;
      text-decoration: underline;
    }
    .ftt-bold {
      font-weight: bold;
    }
    .ftt-italic {
      font-style: italic;
    }
    .ftt-image {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em 0;
    }
    .ftt-banner {
      max-width: 100%;
      height: auto;
      margin-bottom: 1.5em;
    }
    .ftt-quote {
      border-left: 4px solid #ccc;
      padding-left: 1em;
      margin: 1em 0;
      font-style: italic;
      color: #666;
    }
    .ftt-raw {
      background-color: #f4f4f4;
      border: 1px solid #ddd;
      padding: 1em;
      font-family: monospace;
      white-space: pre-wrap; /* Or 'pre' if you prefer no wrapping */
      word-wrap: break-word;
      display: block;
      overflow-x: auto;
    }
    .ftt-timestamp {
       font-size: 0.9em;
       color: #777;
    }
    .ftt-author {
       font-size: 0.9em;
       color: #555;
    }
    .ftt-author a {
       color: inherit; /* Example: style link like surrounding text */
       text-decoration: none;
    }
    .ftt-author a:hover {
       text-decoration: underline;
    }
    /* Add styles for H1-H6 if you use them without classes */
    h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: bold;
    }
    ```

## Configuration Options

When creating an `FTT` instance (`new FTT(config)`), you can pass a configuration object with the following optional keys:

*   `tags` (Object): Define or override tag behavior. Keys are the uppercase tag names (e.g., `'P'`, `'MYTAG'`). Values are objects:
    *   `tag` (String): The HTML tag to generate (e.g., `'p'`, `'div'`).
    *   `class` (String): The CSS class to add. An empty string means no class.
    *   `metadata` (Boolean): If `true`, the tag is treated as metadata (extracted, not rendered).
    *   `specialHandling` (Boolean): If `true`, indicates the tag needs custom logic (like `LOC`, `COLOR`). You typically wouldn't define new tags with this unless modifying the core engine.
*   `imgClass` (String): CSS class for `[IMG]` tags (default: `'ftt-image'`).
*   `linkClass` (String): CSS class for `[LINK]` tags (default: `'ftt-link'`).
*   `rawClass` (String): CSS class for the `<pre>` tag generated by `[RAW]` (default: `'ftt-raw'`).
*   `bannerClass` (String): CSS class for `[BANNER]` tags (default: `'ftt-banner'`).
*   `timestampClass` (String): CSS class for `[TIMESTAMP]` tags (default: `'ftt-timestamp'`).
*   `authorClass` (String): CSS class for `[AUTHOR]` tags (default: `'ftt-author'`).
*   `maxIterations` (Number): Safeguard against infinite loops in tag processing (default: `100`).
*   `rawPlaceholderPrefix` (String): Internal prefix for `RAW` placeholders (default: `'%%FTT_RAW_PLACEHOLDER_'`).
*   `enableWarnings` (Boolean): Log warnings to the console for potential issues (e.g., multiple metadata tags, processing errors) (default: `true`).
*   `defaultLang` (String): Default language code used for `[LOC]` tag filtering if not set by `[CONFIG(lang){...}]` (default: `'en'`).

## Security Considerations

FTT includes basic sanitization to mitigate common risks:

*   **HTML Escaping:** Content inside `[RAW]` tags is HTML-escaped before being placed in `<pre>` tags. Alt text in `[IMG]` and `[BANNER]`, link text in `[LINK]`, author names, and timestamp formats/display text are also escaped.
*   **Attribute Sanitization:** URLs in `[IMG]`, `[BANNER]`, `[LINK]`, and `[AUTHOR]` tags are sanitized to allow common protocols (`http:`, `https:`, `ftp:`, `mailto:`, relative paths `/`, `#` anchors, `data:image/`) and prevent `javascript:` URIs. Other potentially unsafe characters are restricted.
*   **Color Sanitization:** Values in `[COLOR]` tags are restricted to reasonably safe CSS color characters (alphanumeric, `#`, `()`, `,`, `.`, `%`, `-`, whitespace) to prevent CSS injection.

While these measures help, FTT is not designed to be a fully robust HTML sanitizer against all possible XSS attacks, especially if you heavily customize tags to allow complex HTML generation. Always treat user-provided FTT input with caution, especially in security-sensitive contexts.

## Contributing

Contributions (bug reports, feature requests, pull requests) are welcome! Please check the repository's guidelines if available.

## License

MIT License. See the LICENSE file for details.
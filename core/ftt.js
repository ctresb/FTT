class FttConfig {
    constructor(customConfig = {}) {
        const defaultConfig = {
            tags: {
                T: { tag: 'h1', class: 'ftt-title' },
                S: { tag: 'h2', class: 'ftt-subtitle' },
                P: { tag: 'p', class: 'ftt-paragraph' },
                Q: { tag: 'blockquote', class: 'ftt-quote' },
                B: { tag: 'strong', class: 'ftt-bold' },
                I: { tag: 'em', class: 'ftt-italic' }
            },
            imgClass: 'ftt-image',
            linkClass: 'ftt-link',
            rawClass: 'ftt-raw',
            maxIterations: 100,
            rawPlaceholderPrefix: '%%FTT_RAW_PLACEHOLDER_',
            enableWarnings: true
        };

        this.config = { ...defaultConfig, ...customConfig };
        this.config.tags = { ...defaultConfig.tags, ...(customConfig.tags || {}) };
    }

    getTagConfig(tag) {
        return this.config.tags[tag.toUpperCase()];
    }

    getAllTagKeys() {
        return Object.keys(this.config.tags);
    }

    getSetting(key) {
        return this.config[key];
    }
}

class FttRegex {
    constructor(tagKeys = []) {
        this.rawRegex = /\[RAW\]([\s\S]*?)\[\/RAW\]/gi;
        this.imgRegex = /\[IMG\(([^)]*?)\)\{([^}]*?)\}\]/gi;
        this.linkRegex = /\[LINK\(([^)]*?)\)\{([^}]*?)\}\]/gi;
        this.brRegex = /\[BR\/\]/gi;
        this.pairedTagRegex = this.buildPairedTagRegex(tagKeys);
    }

    buildPairedTagRegex(tagKeys) {
        if (!tagKeys || tagKeys.length === 0) {
            return new RegExp('a^', 'gi');
        }
        const tagChars = tagKeys.map(key => key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
        return new RegExp(`\\[(${tagChars})\\]([\\s\\S]*?)\\[\\/\\1\\]`, 'gi');
    }
}

class FttSanitizer {
    sanitizeAttr(text) {
        let sanitized = String(text).replace(/"/g, '"');
        if (/^\s*javascript:/i.test(sanitized)) {
            return "#";
        }
        if (!/^(#|ftp:|http:|https:|mailto:|\/|data:image\/)/i.test(sanitized)) {
            return "#";
        }
        return sanitized;
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, `'`);
    }
}

class FttRawContentHandler {
    constructor(placeholderPrefix) {
        this.rawContentMap = new Map();
        this.rawPlaceholderPrefix = placeholderPrefix;
        this.rawCounter = 0;
    }

    extract(text, rawRegex) {
        this.rawContentMap.clear();
        this.rawCounter = 0;
        return text.replace(rawRegex, (match, rawContent) => {
            const placeholder = `${this.rawPlaceholderPrefix}${this.rawCounter++}%%`;
            this.rawContentMap.set(placeholder, rawContent);
            return placeholder;
        });
    }

    restore(text, rawClass, sanitizer) {
        this.rawContentMap.forEach((rawContent, placeholder) => {
            const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const escapedRawContent = sanitizer.escapeHtml(rawContent);
            const wrappedContent = `<pre class="${rawClass}">${escapedRawContent}</pre>`;
            text = text.replace(new RegExp(escapedPlaceholder, 'g'), wrappedContent);
        });
        return text;
    }
}

class FTT {
    constructor(customConfig = {}) {
        this.config = new FttConfig(customConfig);
        this.regex = new FttRegex(this.config.getAllTagKeys());
        this.sanitizer = new FttSanitizer();
        this.rawHandler = new FttRawContentHandler(this.config.getSetting('rawPlaceholderPrefix'));
        this.maxIterations = this.config.getSetting('maxIterations');
    }

    processImages(text) {
        const imgClass = this.config.getSetting('imgClass');
        return text.replace(this.regex.imgRegex, (match, url, altText) => {
            const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
            const sanitizedAlt = this.sanitizer.sanitizeAttr(altText);
            return `<img class="${imgClass}" src="${sanitizedUrl}" alt="${sanitizedAlt}">`;
        });
    }

    processLinks(text) {
        const linkClass = this.config.getSetting('linkClass');
        return text.replace(this.regex.linkRegex, (match, url, linkContent) => {
            const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
            const textContent = linkContent ? this.sanitizer.escapeHtml(linkContent) : this.sanitizer.escapeHtml(url);
            return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${textContent}</a>`;
        });
    }

    processPairedTags(text) {
        let iteration = 0;
        let previousHtml;
        const localMaxIterations = this.maxIterations;
        const localPairedTagRegex = this.regex.pairedTagRegex;

        do {
            previousHtml = text;
            text = text.replace(localPairedTagRegex, (match, tag, content) => {
                const tagConfig = this.config.getTagConfig(tag);
                if (!tagConfig) {
                    return match;
                }
                const htmlTag = tagConfig.tag;
                const className = tagConfig.class ? ` class="${tagConfig.class}"` : '';
                return `<${htmlTag}${className}>${content}</${htmlTag}>`;
            });

            iteration++;
            if (text === previousHtml) {
                break;
            }
        } while (iteration < localMaxIterations);

        if (iteration >= localMaxIterations && this.config.getSetting('enableWarnings')) {
            console.warn("FTT Engine: Max iterations reached for paired tags. Possible unclosed or deeply nested tags.");
        }

        return text;
    }

    processLineBreaks(text) {
        return text.replace(this.regex.brRegex, '<br>');
    }

    convertToHtml(plainText) {
        if (plainText === null || typeof plainText === 'undefined') {
            return '';
        }
        let html = String(plainText);

        html = this.rawHandler.extract(html, this.regex.rawRegex);

        html = this.processImages(html);
        html = this.processLinks(html);
        html = this.processPairedTags(html);
        html = this.processLineBreaks(html);

        html = this.rawHandler.restore(html, this.config.getSetting('rawClass'), this.sanitizer);

        return html;
    }
}

export { FTT, FttConfig, FttRegex, FttSanitizer, FttRawContentHandler };
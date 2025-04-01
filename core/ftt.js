class FttConfig {
    constructor(customConfig = {}) {
        const defaultConfig = {
            tags: {
                T: { tag: 'h1', class: 'ftt-title' },
                S: { tag: 'h2', class: 'ftt-subtitle' },
                P: { tag: 'p', class: 'ftt-paragraph' },
                Q: { tag: 'blockquote', class: 'ftt-quote' },
                B: { tag: 'strong', class: 'ftt-bold' },
                I: { tag: 'em', class: 'ftt-italic' },
                H1: { tag: 'h1', class: '' },
                H2: { tag: 'h2', class: '' },
                H3: { tag: 'h3', class: '' },
                H4: { tag: 'h4', class: '' },
                H5: { tag: 'h5', class: '' },
                H6: { tag: 'h6', class: '' },
                KEYWORDS: { metadata: true },
                CATEGORY: { metadata: true },
                SLUG: { metadata: true },
                CONFIG: { metadata: true },
                LOC: { metadata: true, specialHandling: true },
                COLOR: { specialHandling: true }
            },
            imgClass: 'ftt-image',
            linkClass: 'ftt-link',
            rawClass: 'ftt-raw',
            bannerClass: 'ftt-banner',
            timestampClass: 'ftt-timestamp',
            authorClass: 'ftt-author',
            maxIterations: 100,
            rawPlaceholderPrefix: '%%FTT_RAW_PLACEHOLDER_',
            enableWarnings: true,
            defaultLang: 'en'
        };

        this.config = { ...defaultConfig, ...customConfig };
        this.config.tags = { ...defaultConfig.tags };

        if (customConfig.tags) {
            for (const key in customConfig.tags) {
                if (Object.hasOwnProperty.call(customConfig.tags, key)) {
                    const upperKey = key.toUpperCase();
                    if (defaultConfig.tags[upperKey]) {
                         this.config.tags[upperKey] = { ...defaultConfig.tags[upperKey], ...customConfig.tags[key] };
                    } else {
                         this.config.tags[upperKey] = customConfig.tags[key];
                    }
                }
            }
        }
    }

    getTagConfig(tag) {
        return this.config.tags[tag.toUpperCase()];
    }

    getPairedTagKeys() {
         return Object.keys(this.config.tags).filter(key => {
             const conf = this.config.tags[key];
             return conf && conf.tag && !conf.metadata && !conf.specialHandling;
         });
    }

    getAllTagKeys() {
        return Object.keys(this.config.tags);
    }

    getSetting(key) {
        return this.config[key];
    }
}

class FttRegex {
    constructor(pairedTagKeys = []) {
        this.rawRegex = /\[RAW\]([\s\S]*?)\[\/RAW\]/gi;
        this.imgRegex = /\[IMG\(([^)]*?)\)\{([^}]*?)\}\]/gi;
        this.linkRegex = /\[LINK\(([^)]*?)\)\{([^}]*?)\}\]/gi;
        this.brRegex = /\[BR\/\]/gi;
        this.locRegex = /\[LOC\(([^)]*?)\)\]([\s\S]*?)\[\/LOC\]/gi;
        this.bannerRegex = /\[BANNER\(([^)]*?)\)\{([^}]*?)\}\]/gi;
        this.timestampRegex = /\[TIMESTAMP\(([^)]*?)\)(?:\{([^}]*?)\})?\]/gi;
        this.authorRegex = /\[AUTHOR\(([^)]*?)\)(?:\{([^}]*?)\})?\]/gi;
        this.keywordsRegex = /\[KEYWORDS\]([\s\S]*?)\[\/KEYWORDS\]/gi;
        this.categoryRegex = /\[CATEGORY\]([\s\S]*?)\[\/CATEGORY\]/gi;
        this.slugRegex = /\[SLUG\]([\s\S]*?)\[\/SLUG\]/gi;
        this.configRegex = /\[CONFIG\]\(([^)]*?)\)\{([^}]*?)\}\[\/CONFIG\]/gi;
        this.colorRegex = /\[COLOR\(([^)]+?)\)\]([\s\S]*?)\[\/COLOR\]/gi;
        this.pairedTagRegex = this.buildPairedTagRegex(pairedTagKeys);
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
             if (/:/.test(sanitized) && !/^[a-zA-Z0-9+#./\s-]*$/.test(sanitized)) {
                  return "";
             }
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

    sanitizeColor(color) {
        color = String(color).trim();
        if (/^[a-zA-Z0-9#(),\s.%-]+$/.test(color)) {
             return color.replace(/["']/g, '');
        }
        return 'inherit';
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
        if (text === null || typeof text === 'undefined') {
            return '';
        }
        return String(text).replace(rawRegex, (match, rawContent) => {
            const placeholder = `${this.rawPlaceholderPrefix}${this.rawCounter++}%%`;
            this.rawContentMap.set(placeholder, rawContent);
            return placeholder;
        });
    }

    restore(text, rawClass, sanitizer) {
        if (text === null || typeof text === 'undefined') {
            return '';
        }
        let restoredText = String(text);
        this.rawContentMap.forEach((rawContent, placeholder) => {
            const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const escapedRawContent = sanitizer.escapeHtml(rawContent);
            const wrappedContent = `<pre class="${rawClass}">${escapedRawContent}</pre>`;
            restoredText = restoredText.replace(new RegExp(escapedPlaceholder, 'g'), wrappedContent);
        });
        return restoredText;
    }
}

class FTT {
    constructor(customConfig = {}) {
        this.config = new FttConfig(customConfig);
        this.regex = new FttRegex(this.config.getPairedTagKeys());
        this.sanitizer = new FttSanitizer();
        this.rawHandler = new FttRawContentHandler(this.config.getSetting('rawPlaceholderPrefix'));
        this.maxIterations = this.config.getSetting('maxIterations');
        this.metadata = {};
        this.configValues = {};
        this.currentLang = this.config.getSetting('defaultLang');
    }

    _resetState() {
        this.metadata = { KEYWORDS: null, CATEGORY: null, SLUG: null };
        this.configValues = {};
        this.currentLang = this.config.getSetting('defaultLang');
        this.rawHandler.rawContentMap.clear();
        this.rawHandler.rawCounter = 0;
    }

    _extractConfigAndMetadata(text) {
        let processedText = text;

        processedText = processedText.replace(this.regex.configRegex, (match, key, value) => {
            const cleanKey = String(key).trim().toLowerCase();
            const cleanValue = String(value).trim();
            if (cleanKey) {
                this.configValues[cleanKey] = cleanValue;
                if (cleanKey === 'lang') {
                    this.currentLang = cleanValue || this.config.getSetting('defaultLang');
                }
            }
            return '';
        });

        const metadataTags = {
            KEYWORDS: this.regex.keywordsRegex,
            CATEGORY: this.regex.categoryRegex,
            SLUG: this.regex.slugRegex
        };

        for (const key in metadataTags) {
            processedText = processedText.replace(metadataTags[key], (match, content) => {
                if (this.metadata[key] === null) {
                   this.metadata[key] = String(content).trim();
                } else if (this.config.getSetting('enableWarnings')) {
                   console.warn(`FTT Engine: Multiple [${key}] tags found. Only the first one was used.`);
                }
                return '';
            });
        }
        return processedText;
    }

    _processImages(text) {
        const imgClass = this.config.getSetting('imgClass');
        return text.replace(this.regex.imgRegex, (match, url, altText) => {
            const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
            const escapedAlt = this.sanitizer.escapeHtml(altText);
            return `<img class="${imgClass}" src="${sanitizedUrl}" alt="${escapedAlt}">`;
        });
    }

    _processBanner(text) {
        const bannerClass = this.config.getSetting('bannerClass');
         return text.replace(this.regex.bannerRegex, (match, url, altText) => {
            const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
            const escapedAlt = this.sanitizer.escapeHtml(altText);
            return `<img class="${bannerClass}" src="${sanitizedUrl}" alt="${escapedAlt}">`;
        });
    }

     _processLinks(text) {
        const linkClass = this.config.getSetting('linkClass');
        return text.replace(this.regex.linkRegex, (match, url, linkContent) => {
            const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
            const textContent = linkContent
                               ? this.sanitizer.escapeHtml(linkContent)
                               : this.sanitizer.escapeHtml(url);
            return `<a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${textContent}</a>`;
        });
    }

    _processTimestamp(text) {
        const timestampClass = this.config.getSetting('timestampClass');

        const formatTimestamp = (isoString, formatPattern) => {
            isoString = String(isoString).trim();
            formatPattern = String(formatPattern).trim();

            if (isoString.length < 16 || isoString.charAt(4) !== '-' || isoString.charAt(7) !== '-' || isoString.charAt(10) !== 'T' || isoString.charAt(13) !== ':') {
                 if (this.config.getSetting('enableWarnings')) {
                     console.warn(`FTT Engine: Invalid or incomplete ISO timestamp format provided for formatting: "${isoString}"`);
                 }
                return isoString;
            }

            const parts = {
                yyyy: isoString.substring(0, 4),
                MM: isoString.substring(5, 7),
                dd: isoString.substring(8, 10),
                hh: isoString.substring(11, 13),
                mm: isoString.substring(14, 16),
                yy: isoString.substring(2, 4)
            };

            let result = '';
            let i = 0;
            const len = formatPattern.length;

            while (i < len) {
                let consumed = 0;
                if (formatPattern.substring(i, i + 4) === 'yyyy') {
                    result += parts.yyyy;
                    consumed = 4;
                } else if (formatPattern.substring(i, i + 2) === 'yy') {
                    result += parts.yy;
                    consumed = 2;
                } else if (formatPattern.substring(i, i + 2) === 'MM') {
                    result += parts.MM;
                    consumed = 2;
                } else if (formatPattern.substring(i, i + 2) === 'dd') {
                    result += parts.dd;
                    consumed = 2;
                } else if (formatPattern.substring(i, i + 2) === 'hh') {
                    result += parts.hh;
                    consumed = 2;
                } else if (formatPattern.substring(i, i + 2) === 'mm') {
                    result += parts.mm;
                    consumed = 2;
                }

                if (consumed > 0) {
                    i += consumed;
                } else {
                    result += formatPattern[i];
                    i += 1;
                }
            }
            return result;
        };

        return text.replace(this.regex.timestampRegex, (match, isoString, format) => {
            const sanitizedIsoString = this.sanitizer.escapeHtml(isoString);
            let displayContent = sanitizedIsoString;

            if (format && typeof format === 'string' && format.trim() !== '') {
                 try {
                     displayContent = formatTimestamp(isoString, format);
                 } catch (e) {
                     if (this.config.getSetting('enableWarnings')) {
                         console.warn(`FTT Engine: Error formatting timestamp "${isoString}" with format "${format}". Error: ${e instanceof Error ? e.message : String(e)}`);
                     }
                     displayContent = sanitizedIsoString;
                 }
            }

            return `<time class="${timestampClass}" datetime="${sanitizedIsoString}">${displayContent}</time>`;
        });
    }


    _processAuthor(text) {
        const authorClass = this.config.getSetting('authorClass');
        return text.replace(this.regex.authorRegex, (match, name, url) => {
            const escapedName = this.sanitizer.escapeHtml(name);
            if (url) {
                const sanitizedUrl = this.sanitizer.sanitizeAttr(url);
                return `<span class="${authorClass}"><a href="${sanitizedUrl}" target="_blank" rel="noopener noreferrer">${escapedName}</a></span>`;
            } else {
                return `<span class="${authorClass}">${escapedName}</span>`;
            }
        });
    }

    _processColor(text) {
        let changed = true;
        let iteration = 0;
        const maxColorIterations = this.maxIterations;

        while (changed && iteration < maxColorIterations) {
            changed = false;
            iteration++;
            text = text.replace(this.regex.colorRegex, (match, colors, content) => {
                changed = true;
                const colorParts = String(colors).split(',').map(s => s.trim());
                const fgColor = this.sanitizer.sanitizeColor(colorParts[0]);
                const bgColor = colorParts.length > 1 ? this.sanitizer.sanitizeColor(colorParts[1]) : null;

                let style = `color:${fgColor};`;
                if (bgColor) {
                    style += `background-color:${bgColor};`;
                }

                const processedContent = this._processContentTags(content);

                return `<span style="${style}">${processedContent}</span>`;
            });
             if (iteration >= maxColorIterations && this.config.getSetting('enableWarnings')) {
                 console.warn("FTT Engine: Max iterations reached during COLOR tag processing. Check for deep nesting.");
             }
        }
        return text;
    }

    _processLoc(text) {
        let changed = true;
        let iteration = 0;
        const maxLocIterations = this.maxIterations;

        while(changed && iteration < maxLocIterations) {
            changed = false;
            iteration++;
            text = text.replace(this.regex.locRegex, (match, langCode, content) => {
                 changed = true;
                 const cleanLangCode = String(langCode).trim().toLowerCase();
                 if (cleanLangCode === this.currentLang.toLowerCase()) {
                    return this._processContentTags(content);
                 } else {
                    return '';
                 }
            });
            if (iteration >= maxLocIterations && this.config.getSetting('enableWarnings')) {
                 console.warn("FTT Engine: Max iterations reached during LOC tag processing. Check for nesting or malformed tags.");
            }
        }
        return text;
    }

    _processPairedTags(text) {
        let iteration = 0;
        let previousHtml;
        const localMaxIterations = this.maxIterations;
        const localPairedTagRegex = this.regex.pairedTagRegex;

        if (!localPairedTagRegex || localPairedTagRegex.source === 'a^') {
             return text;
        }

        do {
            previousHtml = text;
            localPairedTagRegex.lastIndex = 0;

            text = text.replace(localPairedTagRegex, (match, tag, content) => {
                const tagConfig = this.config.getTagConfig(tag);
                if (!tagConfig || !tagConfig.tag) {
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
            console.warn("FTT Engine: Max iterations reached for standard paired tags. Check for unclosed, malformed, or excessively nested tags.");
        }

        return text;
    }

     _processLineBreaks(text) {
        return text.replace(this.regex.brRegex, '<br>');
    }

    _processContentTags(text) {
        let processedText = text;
        processedText = this._processImages(processedText);
        processedText = this._processBanner(processedText);
        processedText = this._processLinks(processedText);
        processedText = this._processTimestamp(processedText);
        processedText = this._processAuthor(processedText);
        processedText = this._processColor(processedText);
        processedText = this._processPairedTags(processedText);
        processedText = this._processLineBreaks(processedText);
        return processedText;
    }


    convertToHtml(plainText) {
        this._resetState();

        if (plainText === null || typeof plainText === 'undefined') {
            return '';
        }

        let html = String(plainText);

        html = this.rawHandler.extract(html, this.regex.rawRegex);
        html = this._extractConfigAndMetadata(html);

        html = this._processLoc(html);

        html = this._processContentTags(html);

        html = this.rawHandler.restore(html, this.config.getSetting('rawClass'), this.sanitizer);

        return html.trim();
    }

    getTagContent(tagName) {
        const upperTag = tagName.toUpperCase();
        return this.metadata.hasOwnProperty(upperTag) ? this.metadata[upperTag] : null;
    }

    getConfigValue(key) {
        return this.configValues[key.toLowerCase()];
    }

    getAllMetadata() {
        return { ...this.metadata };
    }

    getAllConfigValues() {
        return { ...this.configValues };
    }
}

export { FTT, FttConfig, FttRegex, FttSanitizer, FttRawContentHandler };

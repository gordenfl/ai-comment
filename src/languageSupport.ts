export interface CommentStyle {
    start: string;
    end?: string;
    linePrefix: string;
}

export class LanguageSupport {
    private supportedLanguages: Map<string, CommentStyle> = new Map();

    constructor() {
        this.initializeLanguages();
    }

    private initializeLanguages() {
        // C++ and C
        this.supportedLanguages.set('cpp', {
            start: '//',
            linePrefix: '//'
        });
        this.supportedLanguages.set('c', {
            start: '//',
            linePrefix: '//'
        });

        // Python
        this.supportedLanguages.set('python', {
            start: '#',
            linePrefix: '#'
        });

        // Lua
        this.supportedLanguages.set('lua', {
            start: '--',
            linePrefix: '--'
        });

        // Java
        this.supportedLanguages.set('java', {
            start: '//',
            linePrefix: '//'
        });

        // JavaScript
        this.supportedLanguages.set('javascript', {
            start: '//',
            linePrefix: '//'
        });
        this.supportedLanguages.set('js', {
            start: '//',
            linePrefix: '//'
        });

        // TypeScript
        this.supportedLanguages.set('typescript', {
            start: '//',
            linePrefix: '//'
        });
        this.supportedLanguages.set('ts', {
            start: '//',
            linePrefix: '//'
        });
    }

    isSupported(languageId: string): boolean {
        return this.supportedLanguages.has(languageId.toLowerCase());
    }

    getCommentStyle(languageId: string): CommentStyle {
        const style = this.supportedLanguages.get(languageId.toLowerCase());
        if (!style) {
            // Default to C-style comments
            return {
                start: '//',
                linePrefix: '//'
            };
        }
        return style;
    }

    getSupportedLanguages(): string[] {
        return Array.from(this.supportedLanguages.keys());
    }
}


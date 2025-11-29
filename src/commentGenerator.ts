import { AIService } from './aiService';
import { LanguageSupport } from './languageSupport';

export class CommentGenerator {
    private aiService: AIService;
    private languageSupport: LanguageSupport;

    constructor(aiService: AIService) {
        this.aiService = aiService;
        this.languageSupport = new LanguageSupport();
    }

    async generateComment(code: string, languageId: string): Promise<string> {
        // Check if language is supported
        if (!this.languageSupport.isSupported(languageId)) {
            throw new Error(`Language ${languageId} is not supported. Supported languages: ${this.languageSupport.getSupportedLanguages().join(', ')}`);
        }

        // Get comment style for the language
        const commentStyle = this.languageSupport.getCommentStyle(languageId);
        
        // Generate comment using AI
        const commentText = await this.aiService.generateComment(code, languageId);
        
        // Format comment according to language style
        return this.formatComment(commentText, commentStyle);
    }

    private formatComment(text: string, style: { start: string; end?: string; linePrefix: string }): string {
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 1) {
            // Single line comment
            return `${style.start} ${lines[0]}`;
        } else {
            // Multi-line comment
            if (style.end) {
                // Block comment style (/* */, <!-- -->, etc.)
                const content = lines.map(line => ` ${style.linePrefix} ${line}`).join('\n');
                return `${style.start}\n${content}\n ${style.end}`;
            } else {
                // Line comment style (//, #, --, etc.)
                return lines.map(line => `${style.start} ${line}`).join('\n');
            }
        }
    }
}


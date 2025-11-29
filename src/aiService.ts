import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';

export interface AIConfig {
    provider: string;
    apiKey: string;
    apiBaseUrl?: string;
    model: string;
    language: string;
}

export class AIService {
    private config: AIConfig;
    private axiosInstance: AxiosInstance;

    constructor() {
        this.config = this.loadConfig();
        this.axiosInstance = axios.create();
        this.updateConfig();
    }

    private loadConfig(): AIConfig {
        const config = vscode.workspace.getConfiguration('ai-comment');
        return {
            provider: config.get<string>('apiProvider', 'openai'),
            apiKey: config.get<string>('apiKey', ''),
            apiBaseUrl: config.get<string>('apiBaseUrl', ''),
            model: config.get<string>('model', 'gpt-3.5-turbo'),
            language: config.get<string>('language', 'auto')
        };
    }

    private updateConfig() {
        this.config = this.loadConfig();
        
        const baseURL = this.config.apiBaseUrl || this.getDefaultBaseURL();
        this.axiosInstance.defaults.baseURL = baseURL;
        
        if (this.config.apiKey) {
            this.axiosInstance.defaults.headers.common['Authorization'] = 
                `Bearer ${this.config.apiKey}`;
        }
    }

    private getDefaultBaseURL(): string {
        switch (this.config.provider) {
            case 'openai':
                return 'https://api.openai.com/v1';
            case 'anthropic':
                return 'https://api.anthropic.com/v1';
            default:
                return this.config.apiBaseUrl || 'https://api.openai.com/v1';
        }
    }

    async generateComment(code: string, language: string): Promise<string> {
        if (!this.config.apiKey) {
            throw new Error('API key is not configured. Please set ai-comment.apiKey in settings.');
        }

        this.updateConfig();

        const prompt = this.buildPrompt(code, language);
        
        try {
            if (this.config.provider === 'anthropic') {
                return await this.callAnthropicAPI(prompt);
            } else {
                return await this.callOpenAIAPI(prompt);
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API request failed: ${error.message}`);
            }
        }
    }

    private buildPrompt(code: string, language: string): string {
        const langName = this.getLanguageName(language);
        const commentLang = this.config.language === 'auto' ? 'the same language as the code' : 
                           this.config.language === 'zh' ? 'Chinese' : 'English';

        // Limit code length to avoid token limits
        const maxCodeLength = 8000;
        const codeToAnalyze = code.length > maxCodeLength 
            ? code.substring(0, maxCodeLength) + '\n... (truncated)'
            : code;

        return `Please generate a concise and clear code comment for the following ${langName} code. 
The comment should:
1. Explain what the code does
2. Describe its purpose and functionality
3. Mention any important details, parameters, or return values if applicable

Generate the comment in ${commentLang}.
IMPORTANT: Return ONLY the comment text without any markdown formatting, code blocks, or additional explanations.
Do not include comment markers (like //, #, --) in your response - just the plain comment text.

Code:
\`\`\`${language}
${codeToAnalyze}
\`\`\`

Comment:`;
    }

    private getLanguageName(languageId: string): string {
        const langMap: { [key: string]: string } = {
            'cpp': 'C++',
            'c': 'C',
            'python': 'Python',
            'lua': 'Lua',
            'java': 'Java',
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'js': 'JavaScript',
            'ts': 'TypeScript'
        };
        return langMap[languageId.toLowerCase()] || languageId;
    }

    private async callOpenAIAPI(prompt: string): Promise<string> {
        const response = await this.axiosInstance.post('/chat/completions', {
            model: this.config.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates code comments. Return only the comment text without any additional formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });

        const comment = response.data.choices[0]?.message?.content?.trim();
        if (!comment) {
            throw new Error('No comment generated from API');
        }

        return this.formatComment(comment);
    }

    private async callAnthropicAPI(prompt: string): Promise<string> {
        // Anthropic API uses a different base URL and endpoint structure
        const anthropicBaseURL = 'https://api.anthropic.com';
        const response = await axios.post(
            `${anthropicBaseURL}/v1/messages`,
            {
                model: this.config.model || 'claude-3-sonnet-20240229',
                max_tokens: 500,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            },
            {
                headers: {
                    'anthropic-version': '2023-06-01',
                    'x-api-key': this.config.apiKey,
                    'content-type': 'application/json'
                }
            }
        );

        const comment = response.data.content[0]?.text?.trim();
        if (!comment) {
            throw new Error('No comment generated from API');
        }

        return this.formatComment(comment);
    }

    private formatComment(comment: string): string {
        // Remove markdown code blocks if present
        comment = comment.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
        // Remove leading/trailing whitespace
        comment = comment.trim();
        return comment;
    }
}


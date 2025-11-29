import * as vscode from 'vscode';
import { CommentGenerator } from './commentGenerator';
import { AIService } from './aiService';

let commentGenerator: CommentGenerator;

export function activate(context: vscode.ExtensionContext) {
    const aiService = new AIService();
    commentGenerator = new CommentGenerator(aiService);

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ai-comment')) {
                // Recreate AI service to reload configuration
                const newAIService = new AIService();
                commentGenerator = new CommentGenerator(newAIService);
            }
        })
    );

    // Register command: Open settings
    const openSettingsCommand = vscode.commands.registerCommand(
        'ai-comment.openSettings',
        async () => {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-comment.apiKey');
        }
    );

    // Register command: Generate comment for selection
    const generateCommentCommand = vscode.commands.registerCommand(
        'ai-comment.generateComment',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            // Check API key before proceeding
            const config = vscode.workspace.getConfiguration('ai-comment');
            const apiKey = config.get<string>('apiKey', '');
            if (!apiKey || apiKey.trim() === '') {
                const action = await vscode.window.showWarningMessage(
                    'AI Comment: API key is not configured. Please configure your AI API key to use this extension.',
                    'Open Settings',
                    'Cancel'
                );
                if (action === 'Open Settings') {
                    await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-comment.apiKey');
                }
                return;
            }

            const selection = editor.selection;
            const document = editor.document;
            const selectedText = document.getText(selection);

            if (!selectedText.trim()) {
                vscode.window.showWarningMessage('Please select some code to generate comments');
                return;
            }

            // Check if selection is too large (warn user)
            if (selectedText.length > 10000) {
                const result = await vscode.window.showWarningMessage(
                    'The selected code is very large. This may take a while and consume more API tokens. Continue?',
                    'Continue',
                    'Cancel'
                );
                if (result !== 'Continue') {
                    return;
                }
            }

            await generateAndInsertComment(editor, selection, selectedText, document);
        }
    );

    // Register command: Generate comments for entire file
    const generateFileCommentsCommand = vscode.commands.registerCommand(
        'ai-comment.generateFileComments',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            // Check API key before proceeding
            const config = vscode.workspace.getConfiguration('ai-comment');
            const apiKey = config.get<string>('apiKey', '');
            if (!apiKey || apiKey.trim() === '') {
                const action = await vscode.window.showWarningMessage(
                    'AI Comment: API key is not configured. Please configure your AI API key to use this extension.',
                    'Open Settings',
                    'Cancel'
                );
                if (action === 'Open Settings') {
                    await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-comment.apiKey');
                }
                return;
            }

            const document = editor.document;
            const fullText = document.getText();

            if (!fullText.trim()) {
                vscode.window.showWarningMessage('The file is empty');
                return;
            }

            // Check if file is too large (warn user)
            if (fullText.length > 50000) {
                const result = await vscode.window.showWarningMessage(
                    'The file is very large. Generating comments for the entire file may take a while and consume many API tokens. Continue?',
                    'Continue',
                    'Cancel'
                );
                if (result !== 'Continue') {
                    return;
                }
            }

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(fullText.length)
            );

            await generateAndInsertComment(editor, fullRange, fullText, document);
        }
    );

    context.subscriptions.push(openSettingsCommand);
    context.subscriptions.push(generateCommentCommand);
    context.subscriptions.push(generateFileCommentsCommand);
}

async function generateAndInsertComment(
    editor: vscode.TextEditor,
    range: vscode.Range,
    code: string,
    document: vscode.TextDocument
) {
    // Show progress indicator
    const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: "Generating comment...",
        cancellable: false
    };

    try {
        const comment = await vscode.window.withProgress(progressOptions, async () => {
            const language = document.languageId;
            return await commentGenerator.generateComment(code, language);
        });

        if (!comment) {
            vscode.window.showErrorMessage('Failed to generate comment');
            return;
        }

        // Get indentation from the first line of selected code
        const startLine = document.lineAt(range.start.line);
        const leadingWhitespace = startLine.text.match(/^\s*/)?.[0] || '';
        
        // Format comment with proper indentation
        const commentLines = comment.split('\n');
        const indentedComment = commentLines
            .map((line, index) => {
                if (index === 0) {
                    return leadingWhitespace + line;
                }
                return leadingWhitespace + line;
            })
            .join('\n');

        // Insert comment before the selected code
        const insertPosition = range.start;
        const commentText = indentedComment + '\n';
        
        const success = await editor.edit(editBuilder => {
            editBuilder.insert(insertPosition, commentText);
        });

        if (success) {
            vscode.window.showInformationMessage('✓ Comment generated successfully!');
        } else {
            vscode.window.showErrorMessage('Failed to insert comment');
        }
    } catch (error: any) {
        let errorMessage = 'Error generating comment';
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }
        
        // Check if it's an API key error and offer to open settings
        if (error.message && error.message.includes('API key')) {
            const action = await vscode.window.showErrorMessage(
                errorMessage,
                'Open Settings'
            );
            if (action === 'Open Settings') {
                await vscode.commands.executeCommand('workbench.action.openSettings', 'ai-comment.apiKey');
            }
        } else {
            vscode.window.showErrorMessage(errorMessage);
        }
    }
}

export function deactivate() {}


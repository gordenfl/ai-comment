import * as vscode from 'vscode';
import { CommentGenerator } from './commentGenerator';
import { AIService } from './aiService';

let commentGenerator: CommentGenerator;

export function activate(context: vscode.ExtensionContext) {
    const aiService = new AIService();
    commentGenerator = new CommentGenerator(aiService);

    // Register command: Generate comment for selection
    const generateCommentCommand = vscode.commands.registerCommand(
        'ai-comment.generateComment',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const selection = editor.selection;
            const document = editor.document;
            const selectedText = document.getText(selection);

            if (!selectedText.trim()) {
                vscode.window.showErrorMessage('Please select some code to generate comments');
                return;
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

            const document = editor.document;
            const fullText = document.getText();

            if (!fullText.trim()) {
                vscode.window.showErrorMessage('The file is empty');
                return;
            }

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(fullText.length)
            );

            await generateAndInsertComment(editor, fullRange, fullText, document);
        }
    );

    context.subscriptions.push(generateCommentCommand);
    context.subscriptions.push(generateFileCommentsCommand);
}

async function generateAndInsertComment(
    editor: vscode.TextEditor,
    range: vscode.Range,
    code: string,
    document: vscode.Document
) {
    try {
        vscode.window.showInformationMessage('Generating comments...');
        
        const language = document.languageId;
        const comment = await commentGenerator.generateComment(code, language);

        if (!comment) {
            vscode.window.showErrorMessage('Failed to generate comment');
            return;
        }

        // Insert comment before the selected code
        const insertPosition = range.start;
        const commentText = comment + '\n';
        
        await editor.edit(editBuilder => {
            editBuilder.insert(insertPosition, commentText);
        });

        vscode.window.showInformationMessage('Comment generated successfully!');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error generating comment: ${error.message}`);
    }
}

export function deactivate() {}


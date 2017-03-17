'use strict';
import * as vscode from 'vscode';


const NUMBER_OF_ERRORS = 5000;
const NUMBER_OF_MESSAGES = 100000;
const NUMBER_OF_MESSAGES_PER_CHANNEL = 50000;
const NUMBER_OF_TERMINAL_MESSAGES = 10000;
const NUMBER_OF_TERMINALS = 10;

export function activate(context: vscode.ExtensionContext) {

    let diagnosticCollections = [];
    let terminals = [];


    let disposable = vscode.commands.registerCommand('crazy.pushDiagnostics', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.commands.executeCommand('workbench.action.output.toggleOutput').then(() => {
                return vscode.commands.executeCommand('workbench.actions.view.problems');
            }).then(() => {
                return vscode.window.showInputBox({ value: NUMBER_OF_ERRORS.toString(), prompt: 'Number of errors to generate' });
            }).then((value) => {
                
                let source = `crazy-${Date.now()}`;
                let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection(source);
                diagnosticCollections.push(diagnosticCollection);
                context.subscriptions.push(diagnosticCollection);
                let diagnostics: vscode.Diagnostic[] = [];
                let diagnostic: vscode.Diagnostic;

                let numberOfErrors = parseInt(value);
                for (let i = 0; i < numberOfErrors; i++) {
                    diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 0), `error #${i} on ${source}`, vscode.DiagnosticSeverity.Error);
                    diagnostic.source = source;
                    diagnostics.push(diagnostic);
                    diagnosticCollection.set(editor.document.uri, diagnostics);
                }
            });
        }
    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('crazy.clearDiagnostics', () => {
        diagnosticCollections.forEach(c => c.clear());
    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('crazy.floodOutput', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_MESSAGES.toString(), prompt: 'Number of output messages to generate' }).then((value) => {
            let outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now()}`);
            context.subscriptions.push(outputChannel);
            outputChannel.show(false);
            let numberOfMessages = parseInt(value);
            for (let i = 0; i < numberOfMessages; i++) {
                outputChannel.appendLine(`message #${i}`);
            }
        });    
    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('crazy.floodTwoOutputs', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_MESSAGES_PER_CHANNEL.toString(), prompt: 'Number of output messages per channel to generate' }).then((value) => {

            let outputChannelA: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now()}`);
            context.subscriptions.push(outputChannelA);
            let outputChannelB: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now() + 1}`);
            context.subscriptions.push(outputChannelB);

            let numberOfMessagesPerChannel = parseInt(value);
            for (let i = 0; i < numberOfMessagesPerChannel; i++) {
                let rem = i % 41;
                if (rem === 0) {
                    outputChannelA.show(false);
                } else if (rem === 20) {
                    outputChannelB.show(false);
                }
                outputChannelA.appendLine(`message #${i} to A`);
                outputChannelB.appendLine(`message #${i} to B`);
            }
        });    
    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('crazy.floodTenTerminals', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_TERMINAL_MESSAGES.toString(), prompt: 'Number of output messages per terminal to generate' }).then((value) => {
            let numberOfTerminalMessages = parseInt(value);
            for (let i = 0; i < NUMBER_OF_TERMINALS; i++) {
                let terminal: vscode.Terminal = vscode.window.createTerminal(`crazy-${Date.now()}`);
                terminals.push(terminal);
                terminal.show(false);
                terminal.sendText(`let COUNTER=0; while [ $COUNTER -lt ${numberOfTerminalMessages} ]; do echo The counter is $COUNTER; let COUNTER=COUNTER+1; done`, true);
            }
        });    
    });
    context.subscriptions.push(disposable);



    disposable = vscode.commands.registerCommand('crazy.closeTerminals', () => {
        terminals.forEach(t => t.dispose());
        terminals = [];
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}
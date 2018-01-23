'use strict';
import * as vscode from 'vscode';
import * as expensive from './expensive';
import * as external from './external';


const NUMBER_OF_ERRORS_LARGE = 5000;
const NUMBER_OF_ERRORS_SMALL = 2;
const NUMBER_OF_FILES = 10000;
const NUMBER_OF_MESSAGES = 100000;
const NUMBER_OF_MESSAGES_PER_CHANNEL = 50000;
const NUMBER_OF_TERMINAL_MESSAGES = 10000;
const NUMBER_OF_TERMINALS = 10;
const NUMBER_OF_EXCEPTIONS = 10000;

export function activate(context: vscode.ExtensionContext) {

    let diagnosticCollections = [];
    let terminals = [];
    let outputChannels = [];

    function throwExceptions(numberOfExceptions: number = NUMBER_OF_EXCEPTIONS) {

        let outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-exceptions-${Date.now()}`);
        outputChannels.push(outputChannel);
        outputChannel.show(false);

        for (let i = 0; i < numberOfExceptions; i++) {
            setTimeout(() => {
                if (i % 200 === 0) {
                    outputChannel.appendLine(`${i + 1} exceptions thrown`);
                }
                throw new Error();
            }, 1);
        }
    }

    function floodTerminals(numberOfTerminalMessages: number = NUMBER_OF_TERMINAL_MESSAGES) {
        for (let i = 0; i < NUMBER_OF_TERMINALS; i++) {
            let terminal: vscode.Terminal = vscode.window.createTerminal(`crazy-${Date.now()}`);
            terminals.push(terminal);
            terminal.show(false);
            terminal.sendText(`let COUNTER=0; while [ $COUNTER -lt ${numberOfTerminalMessages} ]; do echo The counter is $COUNTER; let COUNTER=COUNTER+1; done`, true);
        }
    }

    function floodTwoChannels(numberOfMessagesPerChannel: number = NUMBER_OF_MESSAGES_PER_CHANNEL) {

        let outputChannelA: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now()}`);
        outputChannels.push(outputChannelA);
        let outputChannelB: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now() + 1}`);
        outputChannels.push(outputChannelB);

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
    }

    function floodOneChannel(numberOfMessages: number = NUMBER_OF_MESSAGES) {
        let outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(`crazy-${Date.now()}`);
        outputChannels.push(outputChannel);
        outputChannel.show(false);
        for (let i = 0; i < numberOfMessages; i++) {
            outputChannel.appendLine(`message #${i}`);
        }
    }

    function floodDiagnostics(editor: vscode.TextEditor = vscode.window.activeTextEditor, numberOfErrors: number = NUMBER_OF_ERRORS_LARGE, numberOfFiles: number = 1) {
        if (editor) {
            let source = `crazy-${Date.now()}`;
            let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection(source);
            diagnosticCollections.push(diagnosticCollection);

            let basicUri = editor.document.uri;
            let basicPath = basicUri.path;
            basicPath = basicPath.slice(0, basicPath.lastIndexOf('/'));

            for (let i = 0; i < numberOfFiles; i++) {
                let diagnostics: vscode.Diagnostic[] = [];
                let diagnostic: vscode.Diagnostic;
                let uri = i === 0 ? basicUri : basicUri.with({ path: `${basicPath}/file-${i}.js` });
                for (let j = 0; j < numberOfErrors; j++) {
                    diagnostic = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 0), `error #${j}-${i} on ${source}`, vscode.DiagnosticSeverity.Error);
                    diagnostic.source = source;
                    diagnostics.push(diagnostic);
                    diagnosticCollection.set(uri, diagnostics); // this call is intentionally inside the loop to simulate a programming error
                }
            }
        }
    }



    let disposable = vscode.commands.registerCommand('crazy.floodDiagnostics', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.commands.executeCommand('workbench.action.output.toggleOutput')
                .then(() => vscode.commands.executeCommand('workbench.actions.view.problems'))
                .then(() => vscode.window.showInputBox({ value: NUMBER_OF_ERRORS_LARGE.toString(), prompt: 'Number of errors to generate' }))
                .then(value => parseInt(value))
                .then(numberOfErrors => floodDiagnostics(editor, numberOfErrors));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('crazy.floodFileDiagnostics', () => {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let numberOfFiles = NUMBER_OF_FILES;
            vscode.commands.executeCommand('workbench.action.output.toggleOutput')
                .then(() => vscode.commands.executeCommand('workbench.actions.view.problems'))
                .then(() => vscode.window.showInputBox({ value: NUMBER_OF_FILES.toString(), prompt: 'Number of files with errors' }))
                .then(value => numberOfFiles = parseInt(value))
                .then(() => vscode.window.showInputBox({ value: NUMBER_OF_ERRORS_SMALL.toString(), prompt: 'Number of errors per file' }))
                .then(value => parseInt(value))
                .then(numberOfErrors => floodDiagnostics(editor, numberOfErrors, numberOfFiles));
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('crazy.clearDiagnostics', () => {
        diagnosticCollections.forEach(c => c.dispose());
        diagnosticCollections = [];
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.floodOutput', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_MESSAGES.toString(), prompt: 'Number of output messages to generate' })
            .then(value => parseInt(value))
            .then(numberOfMessages => floodOneChannel(numberOfMessages));
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.floodTwoOutputs', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_MESSAGES_PER_CHANNEL.toString(), prompt: 'Number of output messages per channel to generate' })
            .then(value => parseInt(value))
            .then(numberOfMessagesPerChannel => floodTwoChannels(numberOfMessagesPerChannel));
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.clearOutputs', () => {
        outputChannels.forEach(out => out.dispose());
        outputChannels = [];
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.floodTenTerminals', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_TERMINAL_MESSAGES.toString(), prompt: 'Number of output messages per terminal to generate' })
            .then(value => parseInt(value))
            .then(numberOfTerminalMessages => floodTerminals(numberOfTerminalMessages));
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.closeTerminals', () => {
        terminals.forEach(t => t.dispose());
        terminals = [];
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.floodWithExceptions', () => {
        vscode.window.showInputBox({ value: NUMBER_OF_EXCEPTIONS.toString(), prompt: 'Number of exception thrown' })
            .then(value => parseInt(value))
            .then(numberOfExceptions => throwExceptions(numberOfExceptions));
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.floodAllAtOnce', () => {
        setTimeout(throwExceptions, 10);
        setTimeout(floodDiagnostics, 10);
        setTimeout(floodOneChannel, 10);
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.createExtensionHostLoad', () => {
        expensive.compute();
    });
    context.subscriptions.push(disposable);


    disposable = vscode.commands.registerCommand('crazy.createExternalProcessLoad', () => {
        external.compute(context);
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}
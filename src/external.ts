import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';


export function compute(context: vscode.ExtensionContext) {
    const file = context.asAbsolutePath('out/src/external-program.js');
    console.log(file);
    const cmd = `node ${file}`;
    try {
        let jsonString = cp.execSync(cmd, { encoding: 'ascii' });
        JSON.parse(jsonString);
    } catch (err) {
        console.error(err);
    }
}
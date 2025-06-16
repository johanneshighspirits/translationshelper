// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { exec, spawn } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const keyRegex = /t\((\'|\")([\w\.]*)(\'|\")\)/i;

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "translationshelper.appendToFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      const selection = editor.document.getText(editor.selection);
      const selectedKeyRange = editor.document.getWordRangeAtPosition(
        editor.selection.start,
        keyRegex
      );
      if (!selectedKeyRange?.isSingleLine) {
        vscode.window.showWarningMessage("No translation key selected");
        return;
      }

      const key = keyRegex
        .exec(editor.document.getText(selectedKeyRange))
        ?.at(2);

      if (!key) {
        vscode.window.showWarningMessage("No translation key found");
        return;
      }

      const input = await vscode.window.showInputBox({
        prompt: `Enter temporary text in English:`,
      });
      const targetFile = vscode.workspace.workspaceFolders?.[0]
        ? path.join(
            vscode.workspace.workspaceFolders[0].uri.fsPath,
            "translations.tmp.json"
          )
        : null;

      if (!targetFile) {
        vscode.window.showErrorMessage("No workspace folder open");
        return;
      }

      const fileContent = fs.readFileSync(targetFile, "utf8");
      const fileData = JSON.parse(fileContent);
      fileData[key] = input || `👉 New translation (${key})`;
      const sortedData = Object.fromEntries(
        Object.keys(fileData)
          .sort()
          .map((key) => [key, fileData[key]])
      );

      fs.writeFileSync(targetFile, JSON.stringify(sortedData, null, 2), "utf8");
      vscode.window.showInformationMessage(
        `Temporary translation added to ${path.basename(targetFile)}`
      );

      const saveSuccess = await saveCurrentFile();
      if (saveSuccess) {
        vscode.window.showInformationMessage("Updating translations...");
        await runNpmScript("translations");
      }
    }
  );

  context.subscriptions.push(disposable);
}

const saveCurrentFile = async () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor to save.");
    return false;
  }

  const document = editor.document;

  if (document.isDirty) {
    const success = await document.save();
    if (success) {
      vscode.window.showInformationMessage("File saved.");
      return true;
    } else {
      vscode.window.showErrorMessage("Failed to save file.");
      return false;
    }
  }
  return true;
};

const runNpmScript = async (scriptName: string) =>
  new Promise((resolve, reject) => {
    if (!vscode.workspace.workspaceFolders) {
      return reject("No active workspace found");
    }
    const outputChannel =
      vscode.window.createOutputChannel("TranslationHelper");
    outputChannel.show(true);

    const npmProcess = spawn("npm", ["run", scriptName], {
      cwd: vscode.workspace.workspaceFolders[0].uri.path,
      shell: true,
    });

    npmProcess.stdout.on("data", (data) =>
      outputChannel.append(data.toString())
    );
    npmProcess.stderr.on("data", (data) =>
      outputChannel.append(data.toString())
    );

    npmProcess.on("close", (code) => {
      outputChannel.appendLine(`\nnpm script exited with code ${code}`);
      if (code === 0) {
        vscode.window.showInformationMessage(
          "Translations updated successfully."
        );
        return resolve(true);
      } else {
        vscode.window.showErrorMessage(`npm script failed (code ${code})`);
        return reject(code);
      }
    });
    npmProcess.on("error", (err) => {
      outputChannel.appendLine(`Error: ${err.message}`);
      vscode.window.showErrorMessage("Failed to run npm script.");
      return reject(err.message);
    });
  });

// This method is called when your extension is deactivated
export function deactivate() {}

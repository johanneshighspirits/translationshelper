// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { AddTempTranslationActionProvider } from "./quick-actions/add-new-temp-translation-action-provider";
import {
  addNewTempTranslation,
  runNpmTranslations,
} from "./commands/add-new-temp-translation";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "translationshelper.appendNewTranslation",
      addNewTempTranslation
    ),
    vscode.commands.registerCommand(
      "translationshelper.bundleTranslations",
      runNpmTranslations
    )
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["typescript", "typescriptreact"],
      new AddTempTranslationActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

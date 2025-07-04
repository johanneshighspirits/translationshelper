import * as vscode from "vscode";
import { translationKeyRegex } from "../commands/add-new-temp-translation";

export class AddTempTranslationActionProvider
  implements vscode.CodeActionProvider
{
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] | undefined {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (
        diagnostic.message.includes(
          `"' is not assignable to parameter of type '"`
        )
      ) {
        const textInRange = document.getText(diagnostic.range);
        if (!translationKeyRegex.test(textInRange)) {
          return;
        }
        const addTempTranslationFix = new vscode.CodeAction(
          `Add new temporary translation for ${textInRange}`,
          vscode.CodeActionKind.QuickFix
        );
        addTempTranslationFix.diagnostics = [diagnostic];

        addTempTranslationFix.command = {
          title: "Add new temporary translation",
          command: "translationshelper.appendNewTranslation",
          arguments: [document.uri, range.start],
        };
        const runTranslationsFix = new vscode.CodeAction(
          "Update translations (npm run translations)",
          vscode.CodeActionKind.QuickFix
        );
        runTranslationsFix.diagnostics = [diagnostic];

        runTranslationsFix.command = {
          title: "Fetch latest translations and bundle locally",
          command: "translationshelper.bundleTranslations",
          arguments: [],
        };

        actions.push(addTempTranslationFix, runTranslationsFix);
      }
    }

    return actions;
  }
}

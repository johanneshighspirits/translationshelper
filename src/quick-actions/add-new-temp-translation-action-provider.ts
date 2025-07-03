import * as vscode from "vscode";

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

        const fix = new vscode.CodeAction(
          `💡 Add new temporary translation for ${textInRange}`,
          vscode.CodeActionKind.QuickFix
        );
        fix.diagnostics = [diagnostic];

        fix.command = {
          title: "Add new temporary translation",
          command: "translationshelper.appendNewTranslation",
          arguments: [document.uri, range.start],
        };

        actions.push(fix);
      }
    }

    return actions;
  }
}

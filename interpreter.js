const vscode = require('vscode');

let outputChannel;

// Erstellt den OutputChannel "StepForge" beim ersten Zugriff und cached ihn danach.
function getOutputChannel() {
  if (!outputChannel) outputChannel = vscode.window.createOutputChannel('StepForge');
  return outputChannel;
}

// Regex ohne 'g'-Flag – wichtig für zeilenweises .test() (lastIndex-Problem vermeiden)
// Baut eine Regex für zeilenweises .test() – entfernt das 'g'-Flag (siehe Hinweis oben).
function lineRegex(pattern, flags) {
  return new RegExp(pattern, (flags || '').replace('g', ''));
}

// Löscht Zeilen wo regex matcht (deleteIfMatch=true) oder nicht matcht (false).
// Alles in einem editor.edit() → ein Undo-Schritt, keine Zeilennummern-Verschiebung.
async function filterLines(editor, regex, deleteIfMatch) {
  const doc = editor.document;
  const ranges = [];
  for (let i = 0; i < doc.lineCount; i++) {
    const line = doc.lineAt(i);
    if (deleteIfMatch ? regex.test(line.text) : !regex.test(line.text)) {
      ranges.push(line.rangeIncludingLineBreak);
    }
  }
  if (ranges.length === 0) return;
  await editor.edit(eb => {
    for (let i = ranges.length - 1; i >= 0; i--) eb.delete(ranges[i]);
  });
}

// op-Dispatch-Tabelle: jeder Eintrag ist ein Handler (editor, step) => Promise.
// Neue Operation = neuer Eintrag hier (siehe CLAUDE.md "Kernidee: op-Dispatch").
const ops = {
  // Löscht alle Zeilen, die auf step.pattern matchen.
  async deleteLinesMatching(editor, step) {
    await filterLines(editor, lineRegex(step.pattern, step.flags), true);
  },

  // Behält nur Zeilen, die auf step.pattern matchen, löscht den Rest.
  async keepLinesMatching(editor, step) {
    await filterLines(editor, lineRegex(step.pattern, step.flags), false);
  },

  // Sucht & ersetzt über den gesamten Dokumenttext (nicht zeilenweise),
  // damit Muster auch über Zeilenumbrüche hinweg greifen. Ergänzt 'g' automatisch.
  async replace(editor, step) {
    let flags = step.flags || '';
    if (!flags.includes('g')) flags += 'g';
    const regex = new RegExp(step.find, flags);
    const doc = editor.document;
    const original = doc.getText();
    const result = original.replace(regex, step.with ?? '');
    if (result === original) return;
    await editor.edit(eb =>
      eb.replace(
        new vscode.Range(doc.positionAt(0), doc.positionAt(original.length)),
        result
      )
    );
  },

  // Führt einen beliebigen registrierten VS-Code-Command aus (step.id, optionale step.args).
  async command(_editor, step) {
    const args = Array.isArray(step.args) ? step.args : [];
    await vscode.commands.executeCommand(step.id, ...args);
  }
};

// Führt alle Schritte eines Makros sequenziell aus und protokolliert den Ablauf
// im OutputChannel. Wirft bei unbekannter op, damit der Aufrufer (try/catch) reagieren kann.
async function runMacro(editor, macro) {
  const ch = getOutputChannel();
  const steps = macro.steps || [];
  ch.appendLine(`[StepForge] Starte: "${macro.name || '?'}" (${steps.length} Schritte)`);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const handler = ops[step.op];
    if (!handler) throw new Error(`Unbekannte Operation: "${step.op}"`);
    ch.appendLine(`  Schritt ${i + 1}: ${step.op}`);
    await handler(editor, step);
  }
  ch.appendLine('[StepForge] Fertig.');
}

module.exports = { runMacro };

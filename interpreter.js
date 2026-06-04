const vscode = require('vscode');

let outputChannel;

function getOutputChannel() {
  if (!outputChannel) outputChannel = vscode.window.createOutputChannel('StepForge');
  return outputChannel;
}

// Regex ohne 'g'-Flag – wichtig für zeilenweises .test() (lastIndex-Problem vermeiden)
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

const ops = {
  async deleteLinesMatching(editor, step) {
    await filterLines(editor, lineRegex(step.pattern, step.flags), true);
  },

  async keepLinesMatching(editor, step) {
    await filterLines(editor, lineRegex(step.pattern, step.flags), false);
  },

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

  async command(_editor, step) {
    const args = Array.isArray(step.args) ? step.args : [];
    await vscode.commands.executeCommand(step.id, ...args);
  }
};

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

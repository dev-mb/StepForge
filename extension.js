const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { runMacro } = require('./interpreter');

const MACRO_EXT = '.json';

// Liefert den Makro-Ordner (konfiguriert oder interner Storage) und legt ihn an.
function getMacroFolder(context) {
  const configured = vscode.workspace.getConfiguration('stepforge').get('macroFolder');
  const folder = configured && configured.trim()
    ? configured.trim()
    : context.globalStorageUri.fsPath;
  fs.mkdirSync(folder, { recursive: true });
  return folder;
}

// Liest alle Makro-Dateien samt Name/Beschreibung aus dem JSON.
function listMacros(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter(f => f.endsWith(MACRO_EXT))
    .map(f => {
      const full = path.join(folder, f);
      let name = f.slice(0, -MACRO_EXT.length);
      let description = '';
      try {
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        name = data.name || name;
        description = data.description || '';
      } catch (_) {
        // Parse-Fehler hier ignorieren.
      }
      return { file: f, full, name, description };
    });
}

// TreeView-Provider: ein Listeneintrag pro Makro-Datei.
class MacroTreeProvider {
  constructor(context) {
    this.context = context;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren() {
    const macros = listMacros(getMacroFolder(this.context));
    return macros.map(m => {
      const item = new vscode.TreeItem(m.name, vscode.TreeItemCollapsibleState.None);
      item.description = m.file;
      item.tooltip = m.description || m.file;
      item.iconPath = new vscode.ThemeIcon('zap');
      item.command = { command: 'stepforge.run', title: 'Ausfuehren', arguments: [m.file] };
      return item;
    });
  }
}

function activate(context) {
  const treeProvider = new MacroTreeProvider(context);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('stepforge.macroList', treeProvider)
  );

  // Liste automatisch aktualisieren, wenn sich Makro-Dateien aendern.
  const folder = getMacroFolder(context);
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(folder, '*' + MACRO_EXT));
  watcher.onDidCreate(() => treeProvider.refresh());
  watcher.onDidDelete(() => treeProvider.refresh());
  watcher.onDidChange(() => treeProvider.refresh());
  context.subscriptions.push(watcher);

  context.subscriptions.push(
    vscode.commands.registerCommand('stepforge.runPicker', async () => {
      const files = listMacros(getMacroFolder(context));
      if (files.length === 0) {
        vscode.window.showInformationMessage('StepForge: Noch keine Makros vorhanden.');
        return;
      }
      const pick = await vscode.window.showQuickPick(
        files.map(m => ({ label: m.name, detail: m.description, file: m.file })),
        { placeHolder: 'Makro auswaehlen', matchOnDetail: true });
      if (pick) vscode.commands.executeCommand('stepforge.run', pick.file);
    }),

    vscode.commands.registerCommand('stepforge.run', async (name) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('StepForge: Kein aktiver Editor.');
        return;
      }
      const filePath = path.join(getMacroFolder(context), name);
      let macro;
      try {
        macro = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        vscode.window.showErrorMessage(`StepForge: Makro konnte nicht geladen werden – ${e instanceof Error ? e.message : e}`);
        return;
      }
      try {
        await runMacro(editor, macro);
        vscode.window.showInformationMessage(`StepForge: „${macro.name || name}" ausgeführt.`);
      } catch (e) {
        vscode.window.showErrorMessage(`StepForge: Fehler in „${macro.name || name}" – ${e instanceof Error ? e.message : e}`);
      }
    }),

    vscode.commands.registerCommand('stepforge.openFolder', async () => {
      const f = getMacroFolder(context);
      await vscode.env.openExternal(vscode.Uri.file(f));
    }),

    vscode.commands.registerCommand('stepforge.refresh', () => treeProvider.refresh())
  );
}

function deactivate() {}

module.exports = { activate, deactivate };

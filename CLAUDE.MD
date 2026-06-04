# StepForge – Projektkontext

VS-Code-Extension zum Ausführen von **Text-Makros, die als JSON definiert sind**.
Ein Makro ist eine Liste deklarativer Schritte (`steps`), die nacheinander auf das
aktive Dokument angewendet werden. Inspiriert vom Makro-Feature aus Notepad++, aber
deklarativ statt aufgezeichnet.

Publisher: `dev-mb` · Sprache der UI/Kommentare: **Deutsch**.

## Tech & Architektur

- **Plain JavaScript (CommonJS)**, kein Build-Step.
- **Keine Laufzeit-Abhängigkeiten**: nur `vscode` (vom Host gestellt) + Node-Builtins
  `fs`, `path`. `@types/node` ist nur Dev-Hilfe fürs Autocomplete.
- Makros sind `.json`-Dateien im globalen Storage-Ordner der Extension
  (`globalStorageUri.fsPath`, entspricht `…/globalStorage/dev-mb.stepforge`).
  Optionaler eigener Pfad über die Einstellung `stepforge.macroFolder`.

### Makro-Format
```json
{
  "name": "Anzeigename",
  "description": "optional",
  "steps": [
    { "op": "deleteLinesMatching", "pattern": "DEBUG", "flags": "i" }
  ]
}
```

### Kernidee: op-Dispatch
Ein `ops`-Objekt bildet `op` -> Handler `(editor, step) => Promise` ab. Der Interpreter
iteriert über `steps` und ruft sequenziell den passenden Handler auf. **Neue Operation =
ein neuer Eintrag in `ops`.**

## Aktueller Stand (fertig)

- **Befehle**: `stepforge.runPicker`, `stepforge.run`, `stepforge.openFolder`,
  `stepforge.refresh`.
- **TreeView** (`MacroTreeProvider`) im eigenen Activity-Bar-Container „StepForge",
  View „Makros". Listet alle `.json` im Makro-Ordner; FileSystemWatcher aktualisiert
  automatisch.
- **Settings**: `stepforge.macroFolder`.
- **Keybinding**: `ctrl+alt+m` -> `runPicker` (when: editorTextFocus).
- **Kontextmenü** im Editor + Titel-Buttons (Refresh, Ordner öffnen) in der View.
- `viewsWelcome` für den Leer-Zustand.

## NOCH NICHT implementiert (= nächste Aufgabe)

- **`stepforge.run` ist ein Stub**: zeigt aktuell nur eine Info-Meldung
  („Ausführung folgt später"). Es lädt das Makro-JSON noch nicht und führt nichts aus.
- Es gibt **noch keine `interpreter.js`** und **kein JSON-Schema**.

## Operations-Vokabular

Geplant für v1 (noch zu implementieren):

| op | Felder | Zweck |
|----|--------|-------|
| `deleteLinesMatching` | `pattern`, `flags?` | Zeilen löschen, die zur Regex passen |
| `keepLinesMatching` | `pattern`, `flags?` | nur passende Zeilen behalten |
| `replace` | `find`, `with`, `flags?` | Suchen & Ersetzen (Regex, alle Treffer) |
| `command` | `id`, `args?` | beliebige VS-Code-Command ausführen |

Später (v1.1+): `mark` (Treffer via Decoration-API hervorheben, kein Edit), `clearMarks`,
`removeBlankLines`, `removeDuplicateLines`, `trimTrailingWhitespace`.

## Wichtige Implementierungs-Regeln (Stolperfallen)

1. **Zeilen-Regex ohne `g`-Flag**: `regex.test()` in einer Schleife merkt sich bei
   globalem RegExp die Position (`lastIndex`) und überspringt Zeilen. Beim zeilenweisen
   Prüfen das `g` entfernen.
2. **Zeilen löschen in EINEM `editor.edit()`**: alle zu löschenden Ranges sammeln
   (`line.rangeIncludingLineBreak`) und gemeinsam löschen -> ein Undo-Schritt, keine
   verschobenen Zeilennummern. `deleteLinesMatching`/`keepLinesMatching` teilen sich
   einen `filterLines(editor, regex, invert)`-Helfer.
3. **`replace` auf dem GANZEN Dokumenttext** (`document.getText()` + ein Replace über die
   volle Range), damit Muster über Zeilenumbrüge hinweg (`\r\n`) funktionieren. `g`-Flag
   automatisch ergänzen, falls nicht gesetzt.
4. **Schritte sequenziell `await`en** -> keine Race Conditions bei Dokument-Edits.
5. **`try/catch` pro Makro-Lauf**, Fehler über `showErrorMessage` + optional einen
   OutputChannel „StepForge" ausgeben. User-Skripte/Makros dürfen die Extension nicht
   abschießen.

## Dateistruktur
```
StepForge/
├─ package.json          # Manifest + contributes
├─ extension.js          # activate(), Commands, TreeProvider, Watcher
├─ interpreter.js        # NOCH ANZULEGEN: ops + runMacro()
├─ .vscode/launch.json   # F5-Dev-Host
├─ media/stepforge.svg   # Activity-Bar-Icon (einfarbig, currentColor)
└─ schemas/macro.schema.json  # NOCH ANZULEGEN: JSON-Schema fürs Autocomplete
```

## Test-Korpus: echte Notepad++-Makros

Diese realen Makros (aus der C4-/Log-Arbeit) sind die Zielanwendungen. Übersetzung in
StepForge-Ops:

- 3x **`replace`**: Folgezeilen an Vorzeile hängen `(\r\n|\n)([^R])` -> `\t$2`;
  CRLF->LF `\r\n` -> `\n`; C4-Info kürzen `(,[0-9]{3})\[(.*)\s-\s` -> `$1 (...) `.
- 2x **`deleteLinesMatching`** / **`keepLinesMatching`**: Java-Stacktrace-Zeilen
  `([\s]{4}(java|app))|(\t(at|\.\.\.))`; nach `^R4` filtern.
- 2x **`mark`** (nur hervorheben, kein Edit): „slow request …"; FMS-Status „Sprechwunsch".

## Roadmap / nächster Meilenstein

1. `interpreter.js` mit op-Dispatch + `replace`, `deleteLinesMatching`,
   `keepLinesMatching`, `command` anlegen.
2. `stepforge.run` in `extension.js` so umbauen, dass es das Makro-JSON lädt und über
   `runMacro()` ausführt (inkl. OutputChannel + try/catch).
3. JSON-Schema + `jsonValidation` (über den Makro-Ordner gebunden, nicht über
   Dateinamen, da Endung jetzt `.json` ist).
4. `mark` über Decoration-API + `clearMarks`.
5. Komfort: „Neues Makro anlegen"-Command.

## Workflow-Hinweis

Installierte `.vsix` lädt Code-Änderungen NICHT automatisch. Zwei Modi:
- **Entwickeln**: F5 / Extension Development Host (live).
- **Benutzen**: nach Änderungen `npx vsce package` + `code --install-extension *.vsix` + Reload.
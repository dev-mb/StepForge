# StepForge

VS-Code-Extension zum Ausfuehren von Text-Makros, die als JSON definiert sind.
Ein Makro ist eine Liste deklarativer Schritte (`steps`), die nacheinander auf
den aktiven Editor angewendet werden.

## Starten (Entwicklung)

1. Ordner in VS Code oeffnen.
2. `F5` druecken -> ein zweites VS-Code-Fenster (Extension Development Host) startet.
3. Eine Datei oeffnen, dann `Strg+Shift+P` -> **StepForge: Makro auswaehlen & ausfuehren**.

Es ist kein `npm install` noetig: die Extension nutzt nur das `vscode`-Modul
(vom Host bereitgestellt) sowie die Node-Builtins `fs` und `path`.

## Makros ablegen

Standardmaessig liegen die Makros in einem internen Ordner
(**StepForge: Makro-Ordner oeffnen**). Alternativ einen eigenen Pfad setzen:
Einstellung `stepforge.macroFolder`.

Dateien muessen auf `*.stepforge.json` enden. Dank `jsonValidation` gibt es
beim Bearbeiten Autovervollstaendigung und Validierung.

## Befehle

- `stepforge.runPicker` - Dropdown mit allen Makros
- `stepforge.run` - Makro per Name (fuer eigene Hotkeys)
- `stepforge.openFolder` - Makro-Ordner im Datei-Manager oeffnen

### Eigener Hotkey

In `keybindings.json`:

```json
{ "key": "ctrl+alt+1", "command": "stepforge.run", "args": "stacktrace-bereinigen" }
```

## Operationen (v1)

| op | Felder | Zweck |
|----|--------|-------|
| `deleteLinesMatching` | `pattern`, `flags?` | Zeilen loeschen, die zur Regex passen |
| `keepLinesMatching` | `pattern`, `flags?` | nur passende Zeilen behalten |
| `replace` | `find`, `with`, `flags?` | Suchen & Ersetzen (Regex, alle Treffer) |
| `command` | `id`, `args?` | beliebige VS-Code-Command ausfuehren |

Neue Operation hinzufuegen = ein Eintrag im `ops`-Objekt in `interpreter.js`
plus ein Block im Schema (`schemas/macro.schema.json`).

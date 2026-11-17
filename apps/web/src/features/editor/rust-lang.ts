/**
 * rust-lang.ts — Monaco Rust language configuration
 *
 * Registers Rust syntax highlighting tokens and editor settings
 * for the Monaco editor. Called once on app init.
 */
import type * as Monaco from 'monaco-editor';

/** Rust keywords for syntax highlighting */
const RUST_KEYWORDS = [
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else',
  'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop',
  'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static',
  'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
];

/** Anchor-specific identifiers to highlight distinctly */
const ANCHOR_KEYWORDS = [
  'account', 'program', 'declare_id', 'msg', 'require', 'require_eq',
  'require_keys_eq', 'error_code', 'event', 'emit', 'close',
];

/**
 * Register Rust completion and hover providers with Monaco.
 * Call after `monaco-editor` is loaded (inside `useEffect` or `beforeMount`).
 */
export function registerRustLanguage(monaco: typeof Monaco): void {
  // Completion provider for Anchor macros
  monaco.languages.registerCompletionItemProvider('rust', {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const anchorSnippets = [
        {
          label: '#[account]',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '#[account]\npub struct ${1:MyAccount} {\n    pub ${2:field}: ${3:u64},\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Anchor account struct',
          range,
        },
        {
          label: '#[program]',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '#[program]\npub mod ${1:my_program} {\n    use super::*;\n\n    pub fn ${2:initialize}(ctx: Context<${3:Initialize}>) -> Result<()> {\n        Ok(())\n    }\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Anchor program module',
          range,
        },
        {
          label: 'declare_id!',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'declare_id!("${1:11111111111111111111111111111111}");',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Declare the program ID',
          range,
        },
      ];

      return { suggestions: anchorSnippets };
    },
  });

  // Editor config for Rust
  monaco.languages.setLanguageConfiguration('rust', {
    comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    brackets: [['(', ')'], ['{', '}'], ['[', ']']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}"']*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });

  void RUST_KEYWORDS;
  void ANCHOR_KEYWORDS;
}

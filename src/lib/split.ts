import { highlightParts, plainText } from "./highlight";

export interface Letter {
  ch: string;
  /** Position among all letters of the text (spaces not counted). */
  i: number;
  /** Inside *asterisks*: shown in the accent color. */
  hl: boolean;
}

/**
 * Split text into words of letters at build time, so the scroll effects need no
 * JavaScript in the browser. "We turn *records* into plans" → 5 words, 23 letters.
 */
export function splitLetters(text: string): { words: Letter[][]; count: number; plain: string } {
  const words: Letter[][] = [];
  let word: Letter[] = [];
  let i = 0;
  for (const part of highlightParts(text)) {
    for (const ch of part.text) {
      if (/\s/.test(ch)) {
        if (word.length) words.push(word);
        word = [];
      } else {
        word.push({ ch, i: i++, hl: part.hl });
      }
    }
  }
  if (word.length) words.push(word);
  return { words, count: i, plain: plainText(text) };
}

import { Injectable } from '@angular/core';

@Injectable()
export class DiceService {

  constructor() { }

  roll(dice: string, verbose: boolean) {
    const result = this.verboseRoll(dice);
    let num = 0;

    if (verbose) {
        return result;
    } else {
      result.forEach(item => num += item);
      return num;
    }
  }

  private verboseRoll(dice: string) {
    let amount = 1,
    mod = 0,
    results: Array<number> = [],
    match,
    num,
    modifiers;

    let parsedDice: number;

    if (!dice) {
      throw new Error('Missing dice parameter.');
    }

    if (typeof dice === 'string') {
      match = dice.match(/^\s*(\d+)?\s*d\s*(\d+)\s*(.*?)\s*$/);

      if (match) {
        if (match[1]) {
          amount = parseInt(match[1], 10);
        }
        if (match[2]) {
          parsedDice = parseInt(match[2], 10);
        }
        if (match[3]) {
          modifiers = match[3].match(/([+-]\s*\d+)/g);
          for (let j = 0; j < modifiers.length; j++) {
            mod += parseInt(modifiers[j].replace(/\s/g, ''), 10);
          }
        }
      } else {
        parsedDice = parseInt(dice, 10);
      }
    }

    if (isNaN(parsedDice)) {
      return [];
    }

    for (let i = 0; i < amount; i++) {
      /* We dont want to ruin verbose, so we dont skip the for loop */
      if (parsedDice !== 0) {
        num = Math.floor(Math.random() * parsedDice + 1);
      } else {
        num = 0;
      }
      results.push(num);
    }

    results = results.sort(function(a, b) {
      return a - b;
    });

    if (mod !== 0) {
      results.push(mod);
    }

    return results;
  }
}

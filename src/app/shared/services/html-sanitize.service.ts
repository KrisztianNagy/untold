import { Injectable } from '@angular/core';
import { AST } from '../models/html-parser';
import { TagConstants } from '../constants/ast-constants';

@Injectable()
export class HtmlSanitizeService {

  constructor() { }

  processHtml(html: string, model: object) {
    const ast = this.toAST(html);
  }

  recusiveProcess(ast: AST) {
    if (!ast) {
      return;
    }

    if (ast.attrs) {
      for (const key in ast.attrs) {
        if (ast.attrs.hasOwnProperty(key)) {
          this.processAttribute(ast.attrs, key);
        }
      }
    }

    if (ast.children) {
      ast.children.forEach(child => this.recusiveProcess(child));
    }
  }

  private toAST(html: string): AST {
    return null;
  }

  private processAttribute(attributes: Object, key: string) {
    const content: string = attributes[key];
  }

}

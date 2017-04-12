import { Injectable } from '@angular/core';

import { IBinaryExpression, IExpression, IIdentifier, ILiteral,
         IMemberExpression, IUnaryExpression, ICallExpression } from '../../models/jsep';
import { ExpressionResult } from '../../models/expression-result';
import { Untold } from '../../models/backend-export';

@Injectable()
export class CalculatedExpressionService {

  jsep: any;

  constructor() {
    this.jsep = (<any>window).jsep;
  }

  parseTree(input: string): ExpressionResult {
    try {
      const tree = this.jsep(input);

      return {
          tree: tree,
          error: false,
          errorMessage: ''
      };
    } catch (ex) {
      return {
          tree: null,
          error: true,
          errorMessage: ex.message
      };
    }
  }

  removeSpareSpaces(expression: string) {
    let isStarted = false;
    let lastIndex = 0;
    const spacelessParts: Array<string> = [];

    if (expression.indexOf('\'') > - 1) {
      while (true) {
        const nextIndex = expression.indexOf('\'', lastIndex + 1);

        if (nextIndex > 0) {
          if (isStarted) {
            isStarted = false;
            spacelessParts.push(expression.substring(lastIndex, nextIndex));
          } else {
            isStarted = true;
            spacelessParts.push(expression.substring(lastIndex, nextIndex).split(' ').join(''));
          }

          lastIndex = nextIndex;
        } else {
          if (isStarted) {
            return null;
          } else {
            spacelessParts.push(expression.substring(lastIndex).split(' ').join(''));
            break;
          }
        }
      }

      return spacelessParts.join('');
    }

    return expression.split(' ').join('');
  }

  resolveNode(node: IExpression, definition: Untold.ClientInnerDefinition):
    Untold.ClientInnerDefinition {
    if (!definition) {
      return null;
    }

    switch (node.type) {
      case 'Literal':
       break;
      case 'Identifier':
        definition = this.resolveIdentifier(<IIdentifier> node, definition);
      break;
      case 'BinaryExpression':
        this.resolveBinaryExpression(<IBinaryExpression> node, definition);
      break;
      case 'UnaryExpression':
        this.resolveUnaryExpression(<IUnaryExpression> node, definition);
      break;
      case 'MemberExpression':
        definition = this.resolveMemberExpression(<IMemberExpression> node, definition);
      break;
      case 'CallExpression':
        this.resolveCallExpression(<ICallExpression> node, definition);
      break;
      default:
    }

    return definition;
  }

  private resolveIdentifier(identifier: IIdentifier, definition: Untold.ClientInnerDefinition):
    Untold.ClientInnerDefinition {

    if (definition  && definition.definitions) {
      const matchingDefs = definition.definitions.filter(def => def.name.replace(' ', '').toLowerCase() === identifier.name.toLowerCase());

      if (matchingDefs.length) {
        identifier.name = '_' + <string> matchingDefs[0].occurrenceGuid;
        return matchingDefs[0];
      }
    }

    return null;
  }

  private resolveBinaryExpression(binaryExpression: IBinaryExpression, definition: Untold.ClientInnerDefinition) {
    this.resolveNode(binaryExpression.left, definition);
    this.resolveNode(binaryExpression.right, definition);
  }

  private resolveUnaryExpression(unaryExpression: IUnaryExpression, definition: Untold.ClientInnerDefinition) {
    this.resolveNode(unaryExpression.argument, definition);
  }

  private resolveMemberExpression(memberExpression: IMemberExpression, definition: Untold.ClientInnerDefinition):
    Untold.ClientInnerDefinition {
      return this.resolveNode(memberExpression.property, this.resolveNode(memberExpression.object, definition));
  }

  private resolveCallExpression(callExpression: ICallExpression, definition: Untold.ClientInnerDefinition) {
    if (callExpression.arguments) {
      callExpression.arguments.forEach(arg => this.resolveNode(arg, definition));
    }
  }
}

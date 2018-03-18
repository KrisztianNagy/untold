import { Injectable } from '@angular/core';

import { Untold } from '../../models/backend-export';
import { IBinaryExpression, IExpression, IIdentifier, ILiteral,
  IMemberExpression, IUnaryExpression, ICallExpression } from '../../models/jsep';
import { ExpressionResult } from '../../models/expression-result';
import { SheetElement, SheetProcessingParameters, SheetModel } from '../../../shared/models/sheet-element';

@Injectable()
export class CommandExpressionService {

  constructor() { }

  resolveNode(node: IExpression, models: SheetModel[]) {
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.resolveIdentifier(<IIdentifier> node, models);
      case 'BinaryExpression':
        return this.resolveBinaryExpression(<IBinaryExpression> node, models);
      case 'UnaryExpression':
        return this.resolveUnaryExpression(<IUnaryExpression> node, models);
      case 'MemberExpression':
        return this.resolveMemberExpression(<IMemberExpression> node, models);
      case 'CallExpression':
        return this.resolveCallExpression(<ICallExpression> node, models);
      default:
        throw Error('Unexpected operation');
    }
  }

  private resolveIdentifier(identifier: IIdentifier, models: SheetModel[]): SheetModel {
    const match = models.filter(model => model.name === identifier.name);

    return match.length ? match[0] : null;
  }

  private resolveBinaryExpression(binaryExpression: IBinaryExpression,  models: SheetModel[]) {
    const left = this.resolveNode(binaryExpression.left, models);
    const right = this.resolveNode(binaryExpression.right, models);
  }

  private resolveUnaryExpression(unaryExpression: IUnaryExpression, models: SheetModel[]) {
    throw new Error('Unary is not allowed');
  }

  private resolveMemberExpression(memberExpression: IMemberExpression, models: SheetModel[]) {
    const object: SheetModel = this.resolveNode(memberExpression.object, models);

    if (!object) {
      throw Error('Identifier not allowed');
    }

    const property = this.resolveNode(memberExpression.property, models);

    if (property && typeof property === 'string') {
      const member = object.definition.definitions.filter(def => def.name === property);

      if (member.length === 1) {
        return {
          definition: member[0]
        };
      } else {
        throw Error('Member is not alowed');
      }
    } else {
      throw Error('Member is not string');
    }
  }

  private resolveCallExpression(callExpression: ICallExpression, models: SheetModel[]) {
    return null;
  }
}

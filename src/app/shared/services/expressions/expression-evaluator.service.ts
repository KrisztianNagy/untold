import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { IBinaryExpression, IExpression, IIdentifier, ILiteral,
         IMemberExpression, IUnaryExpression, ICallExpression, IConditionalExpression } from '../../models/jsep';
import { ExpressionOperatorService } from './expression-operator.service';
import { ExpressionFunctionService } from './expression-function.service';
import { GenesisEntity } from '../../models/genesis-entity';
import { Untold } from '../../models/backend-export';

@Injectable()
export class ExpressionEvaluatorService {

  constructor(private expressionOperatorService: ExpressionOperatorService,
              private expressionFunctionService: ExpressionFunctionService) { }

  processExpression(tree: IExpression, entity: GenesisEntity): AsyncSubject<any> {
    return this.processNode(tree, entity);
  }

  private processNode(node: IExpression, entity: GenesisEntity): AsyncSubject<any> {
    entity = JSON.parse(JSON.stringify(entity));

    const nodeSub = new AsyncSubject<any>();
    let resolver: AsyncSubject<any>;

    switch (node.type) {
      case 'Literal':
        resolver = this.resolveLiteral(<ILiteral> node);
      break;
      case 'Identifier':
        resolver = this.resolveIdentifier(<IIdentifier> node, entity);
      break;
      case 'BinaryExpression':
        resolver = this.resolveBinaryExpression(<IBinaryExpression> node, entity);
      break;
      case 'UnaryExpression':
        nodeSub.error('Not implemented type: ' + node.type);
      break;
      case 'MemberExpression':
        resolver = this.resolveMemberExpression(<IMemberExpression> node, entity);
      break;
      case 'CallExpression':
        resolver = this.resolveCallExpression(<ICallExpression> node, entity);
      break;
      case 'ConditionalExpression':
        resolver = this.resolveConditionalExpression(<IConditionalExpression> node, entity);
        break;
      default:
        nodeSub.error('Could not resolve: ' + node.type);
    }

    if (resolver) {
      resolver.subscribe(val =>  {
        nodeSub.next(val);
        nodeSub.complete();
      }, errMsg => nodeSub.error(errMsg));
    } else {
      console.log('Resolver is null for ' + node.type);
    }

    return nodeSub;
  }

  private resolveLiteral(literal: ILiteral): AsyncSubject<any> {
    const literalSub = new AsyncSubject<any>();

    literalSub.next(literal.value);
    literalSub.complete();

    return literalSub;
  }

  private resolveIdentifier(identifier: IIdentifier, entity: GenesisEntity): AsyncSubject<any> {
    entity.entity = entity.entity || {};
    const identifierSub = new AsyncSubject<any>();
    const fieldName = identifier.name.substr(1);

    const defs = entity.definition.definitions
      .filter(def => (<string>def.occurrenceGuid).toLowerCase() === fieldName.toLowerCase());

    if (!defs || defs.length === 0) {
      identifierSub.error('Cannot resolve identifier');
    } else {
      try {
        if (entity.entity.listElements) {
          const arrRes = entity.entity.listElements.map(ent => this.resolveIdentifierValue(defs[0], ent, fieldName));

          if (defs[0].dataType === 'Definition') {
            const nextEntities: GenesisEntity = {
              definition: defs[0],
              entity: {}
            };

            nextEntities.entity.listElements = arrRes.map((res: GenesisEntity) => res.entity);
            identifierSub.next(nextEntities);
            identifierSub.complete();

          } else {
            identifierSub.next(arrRes);
            identifierSub.complete();
          }

        } else {
          identifierSub.next(this.resolveIdentifierValue(defs[0], entity.entity, fieldName));
          identifierSub.complete();
        }
      } catch (err) {
        identifierSub.error(err);
      }
    }

    return identifierSub;
  }

  private resolveIdentifierValue(definition: Untold.ClientInnerDefinition, entity: any, fieldName: string):
    number | string | boolean | GenesisEntity {
     switch (definition.dataType) {
          case 'number':
            const parsed = parseFloat(entity[fieldName]);
            return parsed.toString() === 'NaN' ? 0 : parsed;
          case 'text':
            return entity[fieldName];
          case 'bool':
            return entity[fieldName] ? true : false;
          case 'Definition':
            const nextEntity: GenesisEntity = {
              definition: definition,
              entity: entity[fieldName]
            };

            return nextEntity;
          default:
            throw new Error(('Unexpected definition data type'));
      }
  }

  private resolveMemberExpression(memberExpression: IMemberExpression, entity: GenesisEntity): AsyncSubject<any> {
    const memberSub = new AsyncSubject<any>();

    this.processNode(memberExpression.object, entity).subscribe(res => {
      this.processNode(memberExpression.property, res).subscribe(res2 => {
        memberSub.next(res2);
        memberSub.complete();
      }, err => {
        memberSub.error(err);
      });
    }, err => {
      memberSub.error(err);
    });

    return memberSub;
  }

  private resolveCallExpression(callExpression: ICallExpression, entity: GenesisEntity): AsyncSubject<any> {
    const callSub = new AsyncSubject<any>();
    const name = (<any> callExpression.callee).name.toLowerCase();

    this.resolveCallArguments(callExpression, entity, 0).subscribe(args => {
      switch ((<any> callExpression.callee).name.toLowerCase()) {
        case 'min':
          callSub.next(this.expressionFunctionService.minFunction(args));
          callSub.complete();
        break;
        case 'max':
          callSub.next(this.expressionFunctionService.maxFunction(args));
          callSub.complete();
        break;
        case 'ceil':
          callSub.next(this.expressionFunctionService.ceilFunction(args));
          callSub.complete();
        break;
        case 'floor':
          callSub.next(this.expressionFunctionService.floorFunction(args));
          callSub.complete();
        break;
        case 'sum':
          callSub.next(this.expressionFunctionService.sumFunction(args));
          callSub.complete();
        break;
        case 'table':
          this.expressionFunctionService.tableFunction(args, entity).subscribe(res => {
            callSub.next(res);
            callSub.complete();
          }, err => callSub.error(err));
        break;
        default:
          callSub.error('Could not find function: ' + name);
      }
    });

    return callSub;
  }

  private resolveCallArguments(callExpression: ICallExpression, entity: GenesisEntity, position: number): AsyncSubject<any> {

    const argSub = new AsyncSubject<any>();

    if (callExpression.arguments && callExpression.arguments.length > position) {
      this.processNode(callExpression.arguments[position], entity).subscribe(arg => {
        this.resolveCallArguments(callExpression, entity, position + 1).subscribe( args => {
          argSub.next([arg, ...args]);
          argSub.complete();
        }, err => {
          argSub.error(err);
        });
      }, err => {
        argSub.error(err);
      });
    } else {
      argSub.next([]);
      argSub.complete();
    }

    return argSub;
  }

  private resolveUnaryExpressions(unaryExpression: IUnaryExpression, entity: GenesisEntity): AsyncSubject<any> {
    const unarySub = new AsyncSubject<any>();

    switch (unaryExpression.operator) {
      default:
      unarySub.error('Could not find operator: ' + unaryExpression.operator);
    }

    return unarySub;
  }

  private resolveConditionalExpression(conditionaExpression: IConditionalExpression, entity: GenesisEntity): AsyncSubject<any> {
    const conditionalSub = new AsyncSubject<any>();

    this.processNode(conditionaExpression.test, entity).subscribe(res => {
      this.processNode(conditionaExpression.test.value ? conditionaExpression.consequent : conditionaExpression.alternate, entity)
        .subscribe(nextRes => {
              conditionalSub.next(nextRes);
              conditionalSub.complete();
            }, (err) => conditionalSub.error(err) );
    }, err => {
        conditionalSub.error(err);
    });

    return conditionalSub;
  }

  private resolveBinaryExpression(binaryExpression: IBinaryExpression, entity: GenesisEntity): AsyncSubject<any> {
    const binarySub = new AsyncSubject<any>();

    switch (binaryExpression.operator) {
      case '+':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(this.expressionOperatorService.basicPlusOperator(res[0], res[1]));
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '-':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(this.expressionOperatorService.basicMinusOperator(res[0], res[1]));
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '*':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(this.expressionOperatorService.basicMultipleOperator(res[0], res[1]));
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '/':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(this.expressionOperatorService.basicDivideOperator(res[0], res[1]));
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '&&':
        this.processNode(binaryExpression.left, entity).subscribe(lRes => {
          if (lRes) {
            binarySub.next(lRes);
            binarySub.complete();
          } else {
            this.processNode(binaryExpression.right, entity).subscribe(rRes => {
              binarySub.next(rRes);
              binarySub.complete();
            }, (err) => binarySub.error(err) );
          }
        }, (err) => binarySub.error(err) );
      break;
      case '||':
        this.processNode(binaryExpression.left, entity).subscribe(lRes => {
          if (!lRes) {
            binarySub.next(lRes);
            binarySub.complete();
          } else {
            this.processNode(binaryExpression.right, entity).subscribe(rRes => {
              binarySub.next(rRes);
              binarySub.complete();
            }, (err) => binarySub.error(err) );
          }
        }, (err) => binarySub.error(err) );
      break;
      case '==':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            // tslint:disable-next-line:triple-equals
            binarySub.next(res[0] == res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '===':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] === res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '!=':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            // tslint:disable-next-line:triple-equals
            binarySub.next(res[0] != res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '!==':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] !== res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '>':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] > res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '>=':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] >= res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '<':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] < res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      case '<=':
        this.bothBinaries(binaryExpression, entity).subscribe(res => {
            binarySub.next(res[0] <= res[1]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
      break;
      default:
        binarySub.error('Could not find operator: ' + binaryExpression.operator);
    }

    return binarySub;
  }

  private bothBinaries(binaryExpression: IBinaryExpression, entity: GenesisEntity): AsyncSubject<Array<any>> {
    const binarySub = new AsyncSubject<Array<any>>();
      this.processNode(binaryExpression.left, entity).subscribe(lRes => {
          this.processNode(binaryExpression.right, entity).subscribe(rRes => {
            binarySub.next([lRes, rRes]);
            binarySub.complete();
          }, (err) => binarySub.error(err) );
        }, (err) => binarySub.error(err));
    return binarySub;
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class ExpressionOperatorService {
    public basicPlusOperator(left: any, right: any): any {
        const isString = typeof(left) === 'string' || typeof(right) === 'string';

        if (!isString) {
        left = left ? left : 0;
        right = right ? right : 0;
        }

        return left + right;
    }

    public basicMinusOperator(left: any, right: any): any {
        const isString = typeof(left) === 'string' || typeof(right) === 'string';

        if (!isString) {
        left = left ? left : 0;
        right = right ? right : 0;
        } else {
        return 0;
        }

        return left - right;
    }

    public basicMultipleOperator(left: any, right: any): any {
        const isString = typeof(left) === 'string' || typeof(right) === 'string';

        if (!isString) {
            left = left ? left : 0;
            right = right ? right : 0;
        } else {
            return 0;
        }

        return left * right;
    }

    public basicDivideOperator(left: any, right: any): any {
        const isString = typeof(left) === 'string' || typeof(right) === 'string';

        if (!isString) {
        left = left ? left : 0;
        right = right ? right : 1;

        if (right === 0) {
            return 0;
        }
        } else {
        return 0;
        }

        return left / right;
    }
}
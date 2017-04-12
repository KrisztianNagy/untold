import { IExpression } from './jsep';

export class ExpressionResult {
  tree: IExpression;
  error: boolean;
  errorMessage: string;
}

export class AST {
    type: string;
    name: string;
    content: string;
    attrs: object;
    voidElement: boolean;
    children: Array<AST>;
}

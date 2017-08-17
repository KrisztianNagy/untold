import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';

import { ExpressionTableCacheService } from './expression-table-cache.service';
import { GenesisEntity } from '../../models/genesis-entity';

@Injectable()
export class ExpressionFunctionService {

    constructor(private expressionTableCacheService: ExpressionTableCacheService) {

    }

    public minFunction(args: Array<any>): number {
        if (!args.length) {
            return 0;
        }
        args = this.flatArray(args);
        const numArray = args.map(arg => this.toNumber(arg));
        return Math.min(...numArray);
    }

    public maxFunction(args: Array<any>): number {
        if (!args.length) {
            return 0;
        }

        args = this.flatArray(args);
        const numArray = args.map(arg => this.toNumber(arg));
        return Math.max(...numArray);
    }

    public ceilFunction(args: Array<any>): number {
        if (!args.length) {
            return 0;
        }

        return Math.ceil(this.toNumber(args[0]));
    }

    public floorFunction(args: Array<any>): number {
        if (!args.length) {
            return 0;
        }

        return Math.floor(this.toNumber(args[0]));
    }

    public sumFunction(args: Array<any>): number {
        if (!args.length) {
            return 0;
        }

        args = this.flatArray(args);

        if (!args.length) {
            return 0;
        }

        return args.map(arg => this.toNumber(arg)).reduce((a, b) => {
            return a + b;
        });
    }

    public tableFunction(args: Array<any>, entity: GenesisEntity): AsyncSubject<any> {
        const subject = new AsyncSubject<any>();

        if (args.length < 5) {
            subject.error('Missing table parameters.');
        } else {
            const moduleId = args.length === 5 ? args[4] : entity.definition.moduleGuid;
            this.expressionTableCacheService.getTableValue(args[0], args[1], args[2], args[3], args[4])
                .subscribe(res => {
                    subject.next(res);
                    subject.complete();
                }, err => subject.error(err));
        }

        return subject;
    }

    private flatArray(args: Array<any>): Array<any> {
        return args.reduce((a, b) => a.concat(Array.isArray(b) ? this.flatArray(b) : b), []);
    }

    private toNumber(arg: any) {
        if (typeof(arg) === 'number') {
            return arg;
        }

        if (typeof(arg) === 'string') {
            const parsed = parseFloat((<string>arg));
            return parsed.toString() === 'NaN' ? 0 : parsed;
        }

        return 0;
    }
}

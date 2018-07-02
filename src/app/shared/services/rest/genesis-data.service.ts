import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Response} from '@angular/http';
import { map } from 'rxjs/operators';

import { WebApiService } from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class GenesisDataService {

  constructor(private webApiService: WebApiService) {

  }

  getDefinitionsByRealm(realmId: number): Observable<Untold.ClientRealmDefinitions> {
    return this.webApiService.get('/api/definition/realm/' + realmId)
    .pipe(map(res => JSON.parse(res)));
  }

  deleteModule(id: number): Observable<Response> {
    return this.webApiService.delete('/api/module/' + id);
  }

  createModule(clientModule: Untold.ClientModuleDefinitions) {
    return this.webApiService.post('/api/module/create', clientModule);
  }

  saveDefinition(clientDefinition: Untold.ClientDefinition, realmId: number) {
    return this.webApiService.post('/api/definition/save/' + realmId, clientDefinition);
  }

  deleteDefinition(definitionGuid: string, moduleId: number ): Observable<Response> {
    return this.webApiService.delete('/api/definition/' + definitionGuid + '/module/' + moduleId);
  }

  getRuleTablesByRealm(realmId: number): Observable<Untold.ClientRealmTables> {
    return this.webApiService.get('/api/ruletable/realm/' + realmId)
    .pipe(map(res => JSON.parse(res)));
  }

  getRuleTablesByModule(realmId: number, moduleGuid: string): Observable<Untold.ClientRuleTable[]> {
    return this.webApiService.get('/api/ruletable/realm/' + realmId + '/module/' + moduleGuid)
    .pipe(map(res => JSON.parse(res)));
  }

  saveRuleTableSchema(moduleId: number, ruleTable: Untold.ClientRuleTable) {
    return this.webApiService.put('/api/ruletable/' + moduleId, ruleTable);
  }

  createRuletableSchema(moduleId: number, ruleTable: Untold.ClientRuleTable) {
    return this.webApiService.post('/api/ruletable/' + moduleId, ruleTable);
  }

  deleteRuleTable(moduleId: number, ruleTable: Untold.ClientRuleTable) {
    return this.webApiService.delete('/api/ruletable/' + ruleTable.tableGuid + '/module/' + moduleId);
  }

  bulkInsertRuleTable(moduleId: number, ruleTable: Untold.ClientRuleTableBulkInsert) {
    return this.webApiService.post('/api/ruletable/bulk/' + moduleId, ruleTable);
  }

  getOwnerEntities(realmId: number): Observable<Array<Untold.ClientEntity>> {
    return this.webApiService.get('/api/entity/owner/' + realmId)
      .pipe(map(res => JSON.parse(res)));
  }

  getPlayerEntities(realmId: number): Observable<Array<Untold.ClientEntity>> {
    return this.webApiService.get('/api/entity/player/' + realmId)
      .pipe(map(res => JSON.parse(res)));
  }

  createEntity(realmId: number, clientEntity: Untold.ClientEntity) {
    return this.webApiService.post('/api/entity/create/' + realmId, clientEntity);
  }

  saveEntity(realmId: number, clientEntity: Untold.ClientEntity) {
    return this.webApiService.post('/api/entity/save/' + realmId, clientEntity);
  }

  deleteEntity(entityId: number) {
    return this.webApiService.delete('/api/entity/delete/' + entityId);
  }

  createSheet(realmId: number, clientSheet: Untold.ClientSheet) {
    return this.webApiService.post('/api/sheet/create/' + realmId, clientSheet);
  }

  saveSheet(realmId: number, clientSheet: Untold.ClientSheet) {
    return this.webApiService.post('/api/sheet/save/' + realmId, clientSheet);
  }

  deleteSheet(sheetId: number) {
    return this.webApiService.delete('/api/sheet/delete/' + sheetId);
  }

  getSheetsByRealm(realmId: number): Observable<Array<Untold.ClientSheet>> {
    return this.webApiService.get('/api/sheet/' + realmId)
      .pipe(map(res => JSON.parse(res)));
  }
}

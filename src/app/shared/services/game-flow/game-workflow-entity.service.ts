import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/max';
import 'rxjs/add/operator/map';

import { EntityEnhancerService } from '../expressions/entity-enhancer.service';
import { EntityService } from '../../../store/services/entity.service';
import { GameService } from '../../../store/services/game.service';
import { Untold } from '../../models/backend-export';
import { TreeNodeService } from '../tree-node.service';
import { GenesisEntity, GenesisTreeNode } from '../../../shared/models/genesis-entity';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';

@Injectable()
export class GameWorkflowEntityService {

  constructor(private entityEnhancerService: EntityEnhancerService,
              private gameService: GameService,
              private entityService: EntityService,
              private treeNodeService: TreeNodeService,
              private genesisDataService: GenesisDataService) {
  }

  public createEntity(definition: Untold.ClientDefinition) {
    const tree = this.treeNodeService.getDefinitionMemberTree(<Untold.ClientInnerDefinition> definition);
    const entityValue = this.treeNodeService.getEmptyGenesisEntityFromDefinitionTree(<GenesisTreeNode> tree);

    const entity: Untold.ClientEntity = {
      entity: entityValue,
      definition: null,
      definitionGuid: definition.definitionGuid,
      id: 0,
      moduleGuid: definition.moduleGuid,
      name: definition.name + ' entity',
      users: null
    };

    this.genesisDataService.createEntity(this.gameService.getCurrent().realm.id, entity)
    .subscribe(() => {

    });
  }

  public setCalculatedEntity(entity: Untold.ClientEntity) {
    entity = JSON.parse(JSON.stringify(entity));

    this.entityEnhancerService.loadEntity(entity, this.gameService.getCurrent().realm)
    .subscribe(loadedEntity => {
      this.entityEnhancerService.updateEntityDefinition(loadedEntity);
      this.entityEnhancerService.recalculate(loadedEntity).subscribe(calculated => {
        loadedEntity.entity = calculated;
        this.entityService.addEntity(calculated);
      });
    });
  }

 public saveEntity(entity: Untold.ClientEntity) {
    this.entityEnhancerService.saveEntity(entity, this.gameService.getCurrent().realm)
      .subscribe(() => {
        this.genesisDataService.saveEntity(this.gameService.getCurrent().realm.id, entity)
        .subscribe(() => {
          // TODO: Notify other users
        });
      });
  }

  public deleteEntity(entity: Untold.ClientEntity) {
    this.genesisDataService.deleteEntity( entity.id)
    .subscribe(() => {
      this.entityService.deleteEntity(entity);
      this.entityEnhancerService.deleteEntity(entity, this.gameService.getCurrent().realm);
      // TODO: Notify other users
    });
  }
}

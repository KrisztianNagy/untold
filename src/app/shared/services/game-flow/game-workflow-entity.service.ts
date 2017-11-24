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
import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { GrowlService } from '../growl.service';

@Injectable()
export class GameWorkflowEntityService {

  constructor(private entityEnhancerService: EntityEnhancerService,
              private gameService: GameService,
              private entityService: EntityService,
              private treeNodeService: TreeNodeService,
              private genesisDataService: GenesisDataService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private growlService: GrowlService) {
      this.realmHubListenerService.responseReloadEntities.subscribe(resp => {
        this.loadEntities();
      });

      this.realmHubListenerService.responseEntityDataChange.subscribe(resp => {
        this.synDataChange(resp.Data);
      })
  }

  public loadEntities() {
    const game = this.gameService.getCurrent();

    if (game.realm.isCurrentUserOwner) {
      this.genesisDataService.getOwnerEntities(game.realm.id).subscribe(res => {
        this.entityService.keepEntities(res);
        res.forEach(ent => {
          this.setCalculatedEntity(ent);
        });

        this.growlService.addInfo('Entities', 'The entity list have been updated');
      });
    } else {
      this.genesisDataService.getPlayerEntities(game.realm.id).subscribe(res => {
        this.entityService.keepEntities(res);
        res.forEach(ent => {
          this.setCalculatedEntity(ent);
        });

        this.growlService.addInfo('Entities', 'The entity list have been updated');
      });
    }
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
      users: []
    };

    this.genesisDataService.createEntity(this.gameService.getCurrent().realm.id, entity)
    .subscribe(response => {
      const responseEntityId = JSON.parse(response.json());
      entity.id = responseEntityId;
      this.setCalculatedEntity(entity);
      this.realmHubSenderService.reloadEntities(this.gameService.getCurrent().realm.id);
      this.growlService.addInfo('Entity', 'The entity have been created. Visit the entity page.');
    });
  }

  public setCalculatedEntity(entity: Untold.ClientEntity) {
    entity = JSON.parse(JSON.stringify(entity));

    this.entityEnhancerService.loadEntity(entity, this.gameService.getCurrent().realm)
    .subscribe(loadedEntity => {
      this.entityEnhancerService.updateEntityDefinition(loadedEntity);
      this.entityEnhancerService.recalculate(loadedEntity).subscribe(calculated => {
        loadedEntity.entity = calculated.entity;
        this.entityService.addEntity(calculated);
      });
    });
  }

 public saveEntityValue(entity: Untold.ClientEntity) {
    this.entityEnhancerService.saveEntity(entity, this.gameService.getCurrent().realm)
      .subscribe(() => {
          this.entityService.updateEntity(entity);
          this.realmHubSenderService.entityDataChange({
            id: entity.id,
            name: entity.name,
            realmId: this.gameService.getCurrent().realm.id,
            users: entity.users
          });
      });
  }

  public saveEntityName(entity: Untold.ClientEntity) {
    this.genesisDataService.saveEntity(this.gameService.getCurrent().realm.id, entity)
    .subscribe(() => {
      this.entityService.updateEntity(entity);
        this.realmHubSenderService.reloadEntities(this.gameService.getCurrent().realm.id);
        this.growlService.addInfo('Entity', 'The entity name have been updated..');
    });
  }

  public deleteEntity(entity: Untold.ClientEntity) {
    this.genesisDataService.deleteEntity( entity.id)
    .subscribe(() => {
      this.entityService.deleteEntity(entity);
      this.entityEnhancerService.deleteEntity(entity, this.gameService.getCurrent().realm);
      this.realmHubSenderService.reloadEntities(this.gameService.getCurrent().realm.id)
    });
  }

  private synDataChange(change: Untold.ClientEntityChange) {
    if (!change) {
      return;
    }

    const match = this.entityService.getCurrent().filter(ent => ent.id === change.id);

    if (match.length) {
      const entity: Untold.ClientEntity = JSON.parse(JSON.stringify(match[0]));

      if (entity.name !== change.name) {
        entity.name = change.name;
      }

      this.setCalculatedEntity(entity);
    }
  }
}

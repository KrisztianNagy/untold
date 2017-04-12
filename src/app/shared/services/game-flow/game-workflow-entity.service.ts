import { Injectable } from '@angular/core';

import { EntityEnhancerService } from '../expressions/entity-enhancer.service';
import { EntityService } from '../../../store/services/entity.service';
import { GameService } from '../../../store/services/game.service';
import { Untold } from '../../models/backend-export';
import { TreeNodeService } from '../tree-node.service';
import { GenesisEntity, GenesisTreeNode } from '../../../shared/models/genesis-entity';

@Injectable()
export class GameWorkflowEntityService {

  constructor(private entityEnhancerService: EntityEnhancerService,
              private gameService: GameService,
              private entityService: EntityService,
              private treeNodeService: TreeNodeService) {
  }

  public createEntity(definition: Untold.ClientDefinition) {
    const tree = this.treeNodeService.getDefinitionMemberTree(<Untold.ClientInnerDefinition> definition);
    const entityValue = this.treeNodeService.getEmptyGenesisEntityFromDefinitionTree(<GenesisTreeNode> tree);

    const entity: Untold.ClientEntity = {
      
    }

    this.saveEntity(entity);
  }

  public setCalculatedEntity(entity: Untold.ClientEntity) {
    entity = JSON.parse(JSON.stringify(entity));

    this.entityEnhancerService.updateEntityDefinition(entity);
    this.entityEnhancerService.recalculate(entity.entity).subscribe(calculated => {
      entity.entity = calculated;
      this.entityService.addEntity(entity);
    });
  }


  public saveEntity(entity: Untold.ClientEntity) {
    this.entityEnhancerService.saveEntity(entity, this.gameService.getCurrent().realm)
      .subscribe(() => {
        // TODO: Notify other users
      });
  }

}

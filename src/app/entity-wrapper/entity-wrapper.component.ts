import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityEnhancerService } from '../shared/services/expressions/entity-enhancer.service';
import { DefinitionEnhancerService } from '../shared/services/expressions/definition-enhancer.service';
import { GenesisEntity, GenesisTreeNode } from '../shared/models/genesis-entity';
import { EntityService } from '../store/services/entity.service';
import { SheetService } from '../store/services/sheet.service';
import { GameWorkflowEntityService } from '../shared/services/game-flow/game-workflow-entity.service';
import { SheetEntityService } from '../shared/services/expressions/sheet-entity.service';
import { Sheet } from '../store/models/sheet';
import { Untold } from '../shared/models/backend-export';
import { WebWorkerService } from '../shared/services/web-worker.service';
import { GameWorkflowChatService } from '../shared/services/game-flow/game-workflow-chat.service';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityWrapperComponent implements OnInit, OnDestroy {
  id: number;
  hasSheet: boolean;
  entity: GenesisEntity;
  model: any;
  sheet: Sheet;
  choiceOptions: object;
  definition: Untold.ClientDefinition;
  private entitySub: any;
  private routeSub: any;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
              private sheetEntityService: SheetEntityService,
              private sheetService: SheetService,
              private webWorkerService: WebWorkerService,
              private gameWorkflowChatService: GameWorkflowChatService,
              private route: ActivatedRoute,
              private router: Router) {

  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = parseInt(params['id'], 10);

        this.entitySub = this.entityService.entities
          .subscribe(entities =>
            entities.filter(ent => ent.id === this.id)
              .forEach(ent => {
                this.entityEnhancerService.getGenesisEntity(ent).subscribe(gen => {
                  this.entity = gen;

                  if (ent.sheetId) {
                    this.hasSheet = true;
                    const simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
                    this.model = JSON.parse(JSON.stringify(simple));
                    this.definition = gen.definition;

                    this.sheetService.getCurrent().filter(sh => sh.id === ent.sheetId)
                      .forEach(sheet => {
                        this.sheet = sheet;
                      });
                  } else {
                    this.hasSheet = false;
                  }

                  if (!this.choiceOptions) {
                    this.definitionEnhancerService.getAllChoiceOptions(gen.definition)
                      .subscribe(choiceOptions => {
                      this.choiceOptions = choiceOptions;
                      this.changeDetectorRef.markForCheck();
                      });
                  }

                  this.changeDetectorRef.markForCheck();
                });
            }));
      }
    });
  }

  ngOnDestroy() {
    if (this.entitySub) {
      this.entitySub.unsubscribe();
    }

    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  updateEntity(event: GenesisEntity) {
    this.entityService.getCurrent()
      .filter(ent => ent.id === this.id)
      .forEach(ent => {
        ent.entity = event.entity;

        this.entityEnhancerService.recalculate(ent).subscribe(calculated => {
          this.gameWorkflowEntityService.saveEntityValue(calculated);
      });
    });
  }

  onBuildCompleted(event: boolean) {

  }

  entityChanged(event: any) {
    const genesisEntity = JSON.parse(JSON.stringify(this.entity));
    genesisEntity.entity  = this.sheetEntityService.getEntityFromSimpleEntity(this.entity, event);
    this.updateEntity(genesisEntity);
  }

  onCommandExecuted(commandDetails: any[]) {
    const commandName = <string> commandDetails[0];
    const command = this.sheet.scripts.filter(scr => scr.name === commandName);

    if (command.length) {
      const worker = this.webWorkerService.createCommandWorker(command[0].script, ...commandDetails);
      worker.onmessage = (result) => {
          this.entityChanged(result.data.entity);
          if (result.data.result && result.data.result.constructor === Array) {
            result.data.result.forEach(row => {
              if (typeof row === 'string') {
                this.gameWorkflowChatService.sendMessage(row, null, false);
              }
            })
          }
      };
      worker.postMessage(this.model);
    } else {
      console.log('Command: ' + commandName + ' is not valid');
    }
  }

  onChatExecuted(chatText: string) {
    this.gameWorkflowChatService.sendMessage(chatText, null, false);
  }
}

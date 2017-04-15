import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-definition-side-bar',
  templateUrl: './definition-side-bar.component.html',
  styleUrls: ['./definition-side-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionSideBarComponent implements OnInit, OnDestroy {
  private definitionSubscription;

  constructor(private realmDefinitionService: RealmDefinitionService) {

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.definitionSubscription.unsubscribe();
  }

}

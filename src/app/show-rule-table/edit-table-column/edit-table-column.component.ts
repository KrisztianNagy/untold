import { Component, OnInit, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, DoCheck } from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../shared/models/backend-export';
import { GameService } from '../../store/services/game.service';

@Component({
  selector: 'app-edit-table-column',
  templateUrl: './edit-table-column.component.html',
  styleUrls: ['./edit-table-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTableColumnComponent implements OnInit, DoCheck {
  @Input() column: Untold.ClientRuleTableColumn;
  @Output() onUpdated = new EventEmitter<Untold.ClientRuleTableColumn>();
  draftColumn: Untold.ClientRuleTableColumn;
  columnTypes: Array<SelectItem>;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private gameService: GameService) { }

  ngOnInit() {
    this.draftColumn = JSON.parse(JSON.stringify(this.column));

    this.columnTypes = [];
    this.columnTypes.push({label: 'Text', value: 'text'});
    this.columnTypes.push({label: 'Number', value: 'number'});
    this.columnTypes.push({label: 'Yes/No', value: 'bool'});
  }

  ngDoCheck() {
    this.update();
  }

  update() {
    if (this.draftColumn.name) {
      this.onUpdated.emit(this.draftColumn);
    }
  }

}

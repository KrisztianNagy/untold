import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { InputSwitch } from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-definition-list-config',
  templateUrl: './definition-list-config.component.html',
  styleUrls: ['./definition-list-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionListConfigComponent implements OnInit {
  @Input() definition: Untold.ClientInnerDefinition;
  @Output() onUpdated = new EventEmitter<Untold.ClientInnerDefinition>();
  draftDefinition: Untold.ClientInnerDefinition;
  optionChoice: string = 'user';
  listItems: Array<any>;
  addedItemName: string;

  constructor() { }

  ngOnInit() {
    this.draftDefinition = JSON.parse(JSON.stringify(this.definition));

    if (this.draftDefinition.predefinedListItems) {
      this.listItems = this.draftDefinition.predefinedListItems.map(item => {
        return {text: item};
      });
    } else {
      this.listItems = [];
    }

    this.optionChoice = this.draftDefinition.isPredefinedList ? 'collection' : 'user';
  }

  addItemToCollection() {
    this.listItems = [...this.listItems, { text: this.addedItemName}];
    this.addedItemName = '';
    this.update();
  }

  changeOption(value: string) {
    this.optionChoice = value;
    this.update();
  }

  update() {
    if (this.optionChoice === 'user') {
      this.draftDefinition.predefinedListItems = [];
      this.draftDefinition.isPredefinedList = false;
    } else {
      this.draftDefinition.isPredefinedList = true;
      this.draftDefinition.predefinedListItems = [];

      this.listItems.forEach(item => {
        if (item.text && this.draftDefinition.predefinedListItems.indexOf(item.text) === -1) {
          this.draftDefinition.predefinedListItems.push(item.text);
        }
      });
    }

    this.onUpdated.emit(this.draftDefinition);
  }
}

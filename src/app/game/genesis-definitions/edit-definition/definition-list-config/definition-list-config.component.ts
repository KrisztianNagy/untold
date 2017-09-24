import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {RadioButtonModule} from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-definition-list-config',
  templateUrl: './definition-list-config.component.html',
  styleUrls: ['./definition-list-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionListConfigComponent implements OnInit {
  @Input() definition: Untold.ClientInnerDefinition;
  @Output() onCompleted = new EventEmitter<boolean>();
  optionChoice: string = 'user';
  listItems: Array<any>;
  addedItemName: string;

  constructor() { }

  ngOnInit() {
    if (this.definition.predefinedListItems) {
      this.listItems = this.definition.predefinedListItems.map(item => {
        return {text: item};
      });
    } else {
      this.listItems = [];
    }

    this.optionChoice = this.definition.isPredefinedList ? 'collection' : 'user';
  }

  addItemToCollection() {
    this.listItems.push({ text: this.addedItemName});
    this.addedItemName = '';
  }

  moveUp(index: number) {
    const temp = this.listItems[index];
    this.listItems[index] = this.listItems[index - 1];
    this.listItems[index - 1] = temp;
  }

  moveDown(index: number) {
    const temp = this.listItems[index];
    this.listItems[index] = this.listItems[index + 1];
    this.listItems[index + 1] = temp;
  }

  update() {
    if (this.optionChoice === 'user') {
      this.definition.predefinedListItems = [];
      this.definition.isPredefinedList = false;
    } else {
      this.definition.isPredefinedList = true;
      this.definition.predefinedListItems = [];

      this.listItems.forEach(item => {
        if (item.text && this.definition.predefinedListItems.indexOf(item.text) === -1) {
          this.definition.predefinedListItems.push(item.text);
        }
      });

      this.onCompleted.emit(true);
    }
  }

  cancel() {
    this.onCompleted.emit(false);
  }

}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';

import {DataScroller} from 'primeng/primeng';

import { GameService } from '../../../store/services/game.service';
import { DragConstants } from '../../../shared/constants/drag-constants';
import { DragDataTransfer } from '../../../shared/models/drag-data-transfer';
import { FileDataService } from '../../../shared/services/rest/file-data.service';
import { Untold } from '../../../shared/models/backend-export';

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityListComponent implements OnInit {
  images: Array<Untold.ClientImage>;
  searchFilter: string;
  game: Untold.ClientGameRealmDetails;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private fileDataService: FileDataService,
              private gameService: GameService) {
    this.searchFilter = '';
    this.game = this.gameService.getCurrent();
  }

  ngOnInit() {
    this.images = [];
  }

  loadImages(page: number) {
    this.fileDataService.getMyImages(page, 4, this.searchFilter).subscribe(images => {
      this.images = [...this.images, ...images.clientImages];
      this.changeDetectorRef.markForCheck();
    });
  }

  loadData(event) {
    this.loadImages(event.first / event.rows + 1);
  }

  startDragging(event: DragEvent) {
    let url = (<HTMLImageElement>event.srcElement).src;
    url = url.substring(0, url.indexOf(this.game.accessSignature));

    const a = this.images.filter(img => {
      return img.fileSmallPath === url;
    }).forEach(img => {
      const data: DragDataTransfer = {
        height: 50,
        width: 50,
        type: DragConstants.Image,
        image: img
      };

      event.dataTransfer.setData('text', JSON.stringify(data));
    });

  }

  filterImages() {
    this.images = [];
    this.loadImages(1);

  /*  setTimeout(() => {
      scroller.reset();
      this.changeDetectorRef.markForCheck();
    }, 1);*/
  }
}

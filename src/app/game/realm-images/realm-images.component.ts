import { Component, OnInit } from '@angular/core';

import { Header } from 'primeng/primeng';

import { GameService } from '../../store/services/game.service';
import { FileDataService } from '../../shared/services/rest/file-data.service';
import { Untold } from '../../shared/models/backend-export';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-realm-images',
  templateUrl: './realm-images.component.html',
  styleUrls: ['./realm-images.component.css']
})
export class RealmImagesComponent implements OnInit {
  images: Array<Untold.ClientImage>;
  totalRecords: number;

  game: Untold.ClientGameRealmDetails;

  constructor(private fileDataService: FileDataService,
    private gameService: GameService,
    private authService: AuthService) {

    this.game = this.gameService.getCurrent();
  }

  ngOnInit() {
  }

  loadImages(page: number, event) {
    this.fileDataService.getMyImages(page, 9, '').subscribe(images => {
      this.images = images.clientImages;
      this.totalRecords = images.totalResults;

      this.images.forEach(image => {
        image.fileSmallPath += this.game.accessSignature;
      });
    });
  }

  loadData(event) {
    this.loadImages(event.first / event.rows + 1, event);
  }

  delete(image: Untold.ClientImage) {
    this.fileDataService.deleteImage(image.fileName).subscribe(() => {
      this.images = this.images.filter(img => {
        return img.fileName !== image.fileName;
      });
    });
  }

  onBeforeSend(event) {
    event.xhr.setRequestHeader('Authorization', `Bearer ${this.authService.getAccessToken()}`);
 }

  uploadFile(event) {
    this.fileDataService.upload(event.files).subscribe(() => {
      this.loadImages(1, event);
    });
  }

}

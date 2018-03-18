import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Response} from '@angular/http';

import {WebApiService} from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class FileDataService {

  constructor(private webApiService: WebApiService) {

  }

  upload(files: Array<any>): Observable<any> {

    const input = new FormData();

    files.forEach(file => {
      input.append('file', file);
    });

    return this.webApiService.post('/api/file', input);
  }

  getSize(): Observable<number> {
    return this.webApiService.get('/api/file/size')
      .map(res => JSON.parse(res));
  }

  getMyImages(page: number, pageSize: number, search: string): Observable<Untold.ClientImageGridResult> {
    return this.webApiService.get('/api/file/images/' + page + '/take/' + pageSize + '/' + search)
      .map(res => JSON.parse(res));
  }

  deleteImage(fileName: string): Observable<Response> {
    return this.webApiService.delete('/api/file/delete/' + fileName);
  }
}

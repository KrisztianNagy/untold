import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response} from '@angular/http';
import { map } from 'rxjs/operators';

import { WebApiService } from './web-api.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class UserDataService {

  constructor(private webApiService: WebApiService) {

  }

  searchUsers(text: string): Observable<Untold.ClientUser[]> {
    return this.webApiService.get('api/user/search/' + text)
      .pipe(map(res => JSON.parse(res)));
  }

  ensureUser(user: Untold.ClientUser): Observable<Response> {
    return this.webApiService.post('api/user/ensure', user);
  }
}

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SimpleDungeonService } from './simple-dungeon.service';

let sut: SimpleDungeonService;

describe('Service: SimpleDungeon', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleDungeonService]
    });
  });

  beforeEach(inject([SimpleDungeonService], (srv: SimpleDungeonService) => {
    sut = srv;
  }));

  it('should exist', inject([SimpleDungeonService], () => {
    expect(sut).toBeTruthy();
  }));
});

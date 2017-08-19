import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenesisSheetsComponent } from './genesis-sheets.component';

describe('GenesisSheetsComponent', () => {
  let component: GenesisSheetsComponent;
  let fixture: ComponentFixture<GenesisSheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenesisSheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenesisSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

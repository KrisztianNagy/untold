import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSheetComponent } from './edit-sheet.component';

describe('EditSheetComponent', () => {
  let component: EditSheetComponent;
  let fixture: ComponentFixture<EditSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

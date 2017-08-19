import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheetSideBarComponent } from './sheet-side-bar.component';

describe('SheetSideBarComponent', () => {
  let component: SheetSideBarComponent;
  let fixture: ComponentFixture<SheetSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheetSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheetSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

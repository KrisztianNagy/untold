import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBarChatComponent } from './top-bar-chat.component';

describe('TopBarChatComponent', () => {
  let component: TopBarChatComponent;
  let fixture: ComponentFixture<TopBarChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopBarChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

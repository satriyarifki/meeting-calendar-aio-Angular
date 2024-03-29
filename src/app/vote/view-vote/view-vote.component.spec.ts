import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewVoteComponent } from './view-vote.component';

describe('ViewVoteComponent', () => {
  let component: ViewVoteComponent;
  let fixture: ComponentFixture<ViewVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewVoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

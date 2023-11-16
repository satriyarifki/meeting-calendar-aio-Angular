import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitVoteComponent } from './submit-vote.component';

describe('SubmitVoteComponent', () => {
  let component: SubmitVoteComponent;
  let fixture: ComponentFixture<SubmitVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitVoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

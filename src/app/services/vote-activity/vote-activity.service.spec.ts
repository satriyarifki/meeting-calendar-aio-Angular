import { TestBed } from '@angular/core/testing';

import { VoteActivityService } from './vote-activity.service';

describe('VoteActivityService', () => {
  let service: VoteActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

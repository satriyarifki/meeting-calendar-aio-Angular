import { TestBed } from '@angular/core/testing';

import { CreateActivityService } from './create-activity.service';

describe('CreateActivityService', () => {
  let service: CreateActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

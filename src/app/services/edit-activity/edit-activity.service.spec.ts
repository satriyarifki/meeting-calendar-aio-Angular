import { TestBed } from '@angular/core/testing';

import { EditActivityService } from './edit-activity.service';

describe('EditActivityService', () => {
  let service: EditActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

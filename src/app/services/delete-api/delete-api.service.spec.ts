import { TestBed } from '@angular/core/testing';

import { DeleteApiService } from './delete-api.service';

describe('DeleteApiService', () => {
  let service: DeleteApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

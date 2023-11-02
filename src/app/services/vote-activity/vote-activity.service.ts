import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoteActivityService {
  invokeAlert = new EventEmitter();
  subsVar: Subscription | undefined;
  constructor() {}
  onCallVoteModal() {
    this.invokeAlert.emit({data:0});
  }
}

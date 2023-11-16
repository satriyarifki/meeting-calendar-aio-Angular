import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoteActivityService {
  invokeCreate = new EventEmitter();
  subsVar: Subscription | undefined;
  constructor() {}
  onCallCreateVote() {
    this.invokeCreate.emit({data:0});
  }
}

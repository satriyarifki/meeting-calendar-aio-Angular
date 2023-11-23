import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoteActivityService {
  invokeCreate = new EventEmitter();
  invokeSubmit = new EventEmitter();
  subsVar: Subscription | undefined;
  subsSubmit: Subscription | undefined;
  constructor() {}
  onCallCreateVote() {
    // console.log(this.subsVar);
    this.invokeCreate.emit({data:0});
  }
  onCallSubmitVote(data:any) {
    // console.log(this.subsVar);
    
    this.invokeSubmit.emit(data);
  }
}

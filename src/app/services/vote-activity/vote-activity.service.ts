import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoteActivityService {
  invokeCreate = new EventEmitter();
  invokeSubmit = new EventEmitter();
  invokeView = new EventEmitter();
  subsVar: Subscription | undefined;
  subsSubmit: Subscription | undefined;
  subsView: Subscription | undefined;
  constructor() {}
  onCallCreateVote() {
    // console.log(this.subsVar);
    this.invokeCreate.emit({data:0});
  }
  onCallSubmitVote(data:any) {
    // console.log(this.subsVar);
    this.invokeSubmit.emit(data);
  }
  onCallViewVote(data:any) {
    // console.log(this.subsVar);
    this.invokeView.emit(data);
  }
}

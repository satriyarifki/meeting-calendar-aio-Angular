import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreateActivityService {
  invokeAlert = new EventEmitter();
  subsVar: Subscription | undefined;
  constructor() {}
  onCallCreateModal(date: any,event:any) {
    this.invokeAlert.emit({ date,event });
  }
}

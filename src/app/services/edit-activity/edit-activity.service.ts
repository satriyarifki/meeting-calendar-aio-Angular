import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EditActivityService {
  invokeAlert = new EventEmitter();
  subsVar: Subscription | undefined;
  constructor() {}
  onCallEditModal(id: any) {
    this.invokeAlert.emit({ id });
  }
}

import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertType } from '../alert/alert.model';

@Injectable({
  providedIn: 'root'
})
export class DeleteApiService {

  constructor() { }

  private message = '';

  private type!: AlertType;
  invokeDelete = new EventEmitter();
  subsVar: Subscription | undefined;

  
  onCallDelete(data: any) {
    this.invokeDelete.emit(data);
  }
}

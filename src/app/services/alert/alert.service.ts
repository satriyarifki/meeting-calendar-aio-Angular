import { EventEmitter, Injectable } from '@angular/core';
import { AlertType } from './alert.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  private message = '';

  private type!: AlertType;
  invokeAlert = new EventEmitter();
  subsVar: Subscription | undefined;

  getAlert() {
    return { mess: this.message, typ: this.type };
  }
  clearAlert() {
    this.message = '';
    this.type = AlertType.None;
  }
  onCallAlert(message: string, type: AlertType) {
    this.invokeAlert.emit({ message, type });
  }

}

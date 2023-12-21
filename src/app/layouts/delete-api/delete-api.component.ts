import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DeleteApiService } from 'src/app/services/delete-api/delete-api.service';

@Component({
  selector: 'app-delete-api',
  templateUrl: './delete-api.component.html',
  styleUrls: ['./delete-api.component.css']
})
export class DeleteApiComponent {
  modalName: String = '';
  dataName: String = '';
  func: string = '';
  show: Boolean = false;

  constructor(
    private deleteService: DeleteApiService,
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router
  ) {}

  callModal(params: any) {
    this.dataName = params.dataName;
    this.func = params.func;

    this.show = true;
  }

  ngOnInit() {
    if (this.deleteService.subsVar == undefined) {
      this.deleteService.subsVar = this.deleteService.invokeDelete.subscribe(
        (data: any) => {
          this.callModal(data);
        }
      );
    }
    //
  }
  execDelete() {
    forkJoin(eval(this.func)).subscribe(
      (data: any) => {
        this.alertService.onCallAlert('Delete row success!', AlertType.Success);
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl(this.router.url);
        this.closeDelete();
      },
      (err) => {
        console.log(err);
        this.alertService.onCallAlert(
          'Delete' + ' row' + ' failed!',
          AlertType.Error
        );
      }
    );
  }
  closeDelete() {
    this.modalName = '';
    this.dataName = '';
    this.func = '';
    this.show = false;
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  notifBool:Boolean = false
  voteNotif:any[] = []

  constructor(private authService:AuthService,private alertService:AlertService,private apiService:ApiService, public router:Router){
    apiService.voteDetailsByUserGet(authService.getUser()[0]?.lg_nik).subscribe(res=>{
      console.log(res);
      this.voteNotif = res
      
    })
  }
  onAuthCheck() {
    if (this.authService.getToken() != null) {
      return false;
    }
    return true;
  }
  signOut() {
    this.authService.signOut();
    // window.location.reload();
    this.alertService.onCallAlert('log Out Success', AlertType.Success);
  }
  changeNotifBool(){
    this.notifBool = !this.notifBool
  }
}

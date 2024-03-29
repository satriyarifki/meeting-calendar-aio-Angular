import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @ViewChild('nav')
  nav!: ElementRef;
  box = document.getElementById('#nav')
  notifBool: Boolean = false;
  hide:Boolean = false;

  userData: any;

  //API
  voteNotif: any[] = [];
  voteSelf: any[] = [];

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private apiService: ApiService,
    public router: Router,
    private voteService: VoteActivityService
  ) {
    
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    // console.log(this.nav?.nativeElement.offsetWidth);
    // console.log(this.box);
    this.userData = this.authService.getUser()
    // console.log(this.userData);
    
    forkJoin(
      this.apiService.voteDetailsByUserGet(
        this.authService.getUser()?.lg_nik
      ),
      this.apiService.votesByUserGet(this.authService.getUser()?.lg_nik)
    ).subscribe((res) => {
      this.voteNotif = res[0];
      this.voteSelf = res[1];
      // console.log(this.voteNotif);
      
    });
  }
  onAuthCheck() {
    if (this.authService.getToken() != null) {
      
      return false;
    }
    this.userData = null;
    return true;
  }
  signOut() {
    this.authService.signOut();
    // window.location.reload();
    this.alertService.onCallAlert('log Out Success', AlertType.Success);
  }
  changeNotifBool() {
    this.notifBool = !this.notifBool;
  }
  openSubmitVote(params: any) {
    this.voteService.onCallSubmitVote(params);
  }
  openViewVote(params: any) {
    this.voteService.onCallViewVote(params);
  }
  changeHide(){
    this.hide = !this.hide
    console.log(this.hide);
    if (this.hide) {
      this.notifBool = false
    }
    
  }
}

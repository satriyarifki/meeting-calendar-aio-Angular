import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DeleteApiService } from 'src/app/services/delete-api/delete-api.service';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-view-vote',
  templateUrl: './view-vote.component.html',
  styleUrls: ['./view-vote.component.css'],
})
export class ViewVoteComponent {
  show: Boolean = false;
  load = true;

  vote: any;
  voteDetails: any[] = [];
  usersData: any[] = [];

  constructor(
    private voteService: VoteActivityService,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private deleteService:DeleteApiService
  ) {}
  ngOnInit(): void {
    if (this.voteService.subsView == undefined) {
      this.voteService.subsView = this.voteService.invokeView.subscribe(
        (data: any) => {
          this.callModal(data);
        }
      );
    }
  }

  callModal(data: any) {
    // console.log(data);
    this.vote = data;
    forkJoin(this.apiService.voteDetailsByVoteGet(data.id)).subscribe((res) => {
      this.voteDetails = res[0];
      // console.log(this.voteDetails);

      this.distinctVoteDetails.forEach((elem, i, arr) => {
        // console.log(elem);
        this.authService.employeesGetById(elem.userId).subscribe((resp) => {
          this.usersData.push(resp[0]);
          // console.log(resp[0].employee_code);
          this.usersData.sort(
            (a, b) => Number(a.employee_code) - Number(b.employee_code)
          );
          if (arr.length == i + 1) {
            this.load = false;
            // console.log(this.load);
          }
        });
      });
    });
    setTimeout(() => {
      // console.log(this.usersData);
    }, 2000);

    this.show = true;
  }
  voteDetailsByUser(userId: any) {
    let data = this.voteDetails.filter((data) => data.userId == userId);
    data = data.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    // console.log(data);

    return data;
  }
  get distinctVoteDetails() {
    return this.voteDetails.filter((thing, i, arr) => {
      return arr.indexOf(arr.find((t) => t.userId === thing.userId)) === i;
    });
  }

  arrayTimes(userId:any): any[] {
    let array: any[] = [];
    this.voteDetailsByUser(userId).forEach((elem) => {
      elem.vote_times.forEach((element: any) => {
        array.push(element);
      });
    });
    return array;
  }
  closeModal() {
    this.show = false;
    this.load = true;
    this.voteDetails = [];
    this.usersData = [];
  }

  deleteVotes(id: any,name:any) {
    const fun = 'this.apiService.deleteVotes(' + id + ')';
    this.deleteService.onCallDelete({ dataName: name, func: fun });
    this.closeModal();
  }
}

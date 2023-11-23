import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-submit-vote',
  templateUrl: './submit-vote.component.html',
  styleUrls: ['./submit-vote.component.css'],
})
export class SubmitVoteComponent {
  show: Boolean = false;
  voteParam: any;

  //FORM
  form!: FormGroup;
  voteInput!: FormArray;

  //API
  userData: any;
  voteDetails: any[] = [];

  constructor(
    private voteService: VoteActivityService,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}
  ngOnInit(): void {
    if (this.voteService.subsSubmit == undefined) {
      this.voteService.subsSubmit = this.voteService.invokeSubmit.subscribe(
        (data: any) => {
          this.callModal(data);
        }
      );
    }
  }

  callModal(data: any) {
    // this.initialForm();
    // console.log(this.authService.getUser()[0].lg_nik);
    this.form = this.formBuilder.group({
      voteInput: this.formBuilder.array([]),
    });
    this.voteInput = this.form.get('voteInput') as FormArray;
    // console.log(data);
    this.voteParam = data;
    forkJoin(
      this.authService.employeesGetById(data.userId),
      this.apiService.voteDetailsByVoteGet(data.vote.id)
    ).subscribe((res) => {
      this.userData = res[0][0];
      this.voteDetails = res[1];
      this.pushVoteInput();
      // console.log(this.voteDetails);
      // console.log(this.filterVoteDetailsByUser(this.voteParam.userId));
    });

    this.show = true;
  }

  pushVoteInput() {
    // console.log(this.particip.nativeEle
    this.filterVoteDetailsByUser(this.voteParam.userId).forEach((elem) => {
      this.voteInput.push(
        this.formBuilder.group({
          voteId: [elem.voteId, Validators.required],
          date: [elem.date, Validators.required],
          userId: [elem.userId, Validators.required],
          agree: [elem.agree, Validators.required],
        })
      );
    });

    console.log(this.voteInput);
  }

  onSubmit() {
    console.log(this.voteInput);
    this.apiService.voteDetailsUpdatePut(this.voteInput.value).subscribe(
      (res) => {
        console.log(res);
        this.alertService.onCallAlert(
          'Saving Vote Success!',
          AlertType.Success
        );
      },
      (err) => {
        this.alertService.onCallAlert('Saving Failed!', AlertType.Error);
      }
    );
  }

  closeModal() {
    this.show = false;
  }

  filterVoteDetailsByUser(userId: any) {
    return this.voteDetails.filter((data) => data.userId == userId);
  }
}

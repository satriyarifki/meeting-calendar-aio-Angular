import { Component, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import {
  Form,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { addMonths, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { forkJoin } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-create-vote',
  templateUrl: './create-vote.component.html',
  styleUrls: ['./create-vote.component.css'],
})
export class CreateVoteComponent {
  show: Boolean = false;
  load:Boolean = true
  stepper = 1;

  //FORMS
  formArrayTime!: FormArray;
  form: FormGroup = this.formBuilder.group({
    title: ['', Validators.required],
    desc: '',
    userId: this.authService.getUser().lg_nik,
    arrayTime: this.formBuilder.array([]),
  });

  participantInput: any;
  itemsParticipants!: FormArray;
  itemsDates!: FormArray;
  @ViewChild('particip') particip!: ElementRef;

  //Date
  currentDate = new Date();
  dateParams = this.currentDate;

  //Array
  arrayDateinMonth: any[] = [];
  choosenDate: any[] = [];
  nameEmailEmployee: any[] = [];
  choosenEmployee: any[] = [];

  constructor(
    private voteService: VoteActivityService,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {}
  ngOnInit(): void {
    this.formArrayTime = this.form.get('arrayTime') as FormArray;
    this.itemsParticipants = this.formBuilder.array([]);
    if (this.voteService.subsVar == undefined) {
      this.voteService.subsVar = this.voteService.invokeCreate.subscribe(
        (data: any) => {
          this.load = true
          this.callModal(data);
          this.callApiService();
        }
      );
    }
  }

  callModal(data: any) {
    // this.initialForm();
    // console.log(this.authService.getUser().lg_nik);
    this.loopDate(this.currentDate);
    
    this.form.controls['userId'].setValue(this.authService.getUser().lg_nik);
    this.show = true;
  }

  callApiService() {
    forkJoin(this.apiService.getNameEmailEmployees()).subscribe((res) => {
      this.nameEmailEmployee = res[0];
      this.load = false
    });
  }
  closeModal() {
    this.arrayDateinMonth = [];
    this.choosenEmployee = [];
    this.choosenDate = [];
    this.form.reset();
    this.formArrayTime.clear();
    this.itemsParticipants.clear();
    this.stepper = 1;
    this.show = false;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.alertService.onCallAlert('Title can`t blank', AlertType.Warning);
      return;
    }
    // console.log(this.itemsParticipants.value);
    // console.log(this.choosenDate);

    if (this.itemsParticipants.invalid || this.choosenDate.length == 0) {
      this.alertService.onCallAlert(
        'Date or Participant can`t blank',
        AlertType.Warning
      );
      return;
    }

    let details: any[] = [];
    this.itemsParticipants.value.forEach((parc: any) => {
      this.choosenDate.forEach((date) => {
        // console.log(parc.userId + ' ' + date);
        details.push({
          voteId: 0,
          userId: parc.userId,
          date: date,
          agree: false,
        });
      });
    });
    // console.log(this.itemsParticipants.value);
    // // console.log(this.form.value);
    // return
    this.apiService.votesPost(this.form.value).subscribe(
      (res) => {
        // console.log(res);
        // details.forEach((element, i) => {
        //   details[i].voteId = res.id;
        // });
        this.apiService
          .voteParticipantsPost({
            voteId: res.id,
            array: this.itemsParticipants.value,
          })
          .subscribe((res) => {});
        this.apiService
          .voteDetailsPost({
            voteId: res.id,
            details: this.form.value.arrayTime,
            participants: this.itemsParticipants.value,
          })
          .subscribe(
            (resd) => {
              // console.log(resd);
              // this.apiService.voteTimesPost()
              this.alertService.onCallAlert(
                'Success added vote!',
                AlertType.Success
              );
              this.router.onSameUrlNavigation = 'reload';
              this.router.navigateByUrl(this.router.url);
              this.closeModal();
            },
            (err) => {
              this.alertService.onCallAlert(
                'Failed added vote',
                AlertType.Error
              );
            }
          );
      },
      (er) => {
        console.log(er);

        this.alertService.onCallAlert('Failed added vote', AlertType.Error);
      }
    );
    // const votes = {
    //   title: '',
    //   desc: ''
    //   userId: AuthService.
    // }
  }

  fillFormItems() {}

  pushParticipant() {
    // console.log(this.particip.nativeElement.value);
    if (this.choosenEmployee.indexOf(this.particip.nativeElement.value) == -1) {
      this.choosenEmployee.push(this.particip.nativeElement.value);
      let c = this.nameEmailEmployee.filter(
        (data) => data[2] == this.particip.nativeElement.value
      )[0];
      // console.log(c);

      this.itemsParticipants.push(
        this.formBuilder.group({
          userId: [this.particip.nativeElement.value, Validators.required],
          email: [c[0], Validators.required],
        })
      );
    }
    this.particip.nativeElement.value = '';
  }

  defaultTimes(date: any): FormGroup {
    return this.formBuilder.group({
      date: [date, Validators.required],
      times: this.formBuilder.array([
        this.formBuilder.group({ time: '', agree: false }),
        this.formBuilder.group({ time: '', agree: false }),
        this.formBuilder.group({ time: '', agree: false }),
      ]),
    });
  }
  removeChoosenParticipant(date: any) {
    this.choosenEmployee = this.choosenEmployee.filter((data) => data != date);
  }

  pushChoosenDate(date: any) {
    let arrayTime = this.form.get('arrayTime') as FormArray;
    arrayTime.push(this.defaultTimes(date));
    this.choosenDate.push(date);
  }

  removeChoosenDate(date: any, index: any) {
    this.choosenDate = this.choosenDate.filter((data) => data != date);
    this.formArrayTime.removeAt(index);
    // this.formArrayTime = this.formArrayTime.filter(
    //   (data) => data.value.date != date
    // );
  }

  asFormArray(i: number) {
    return this.formArrayTime.controls[i].get('times') as FormArray;
  }

  checkChoosenDate(date: any): Boolean {
    return this.formArrayTime.value.filter((data: any) => data.date == date)
      .length != 0
      ? false
      : true;
  }

  loopDate(date: any) {
    var firstDay = date;
    firstDay.setDate(1);
    firstDay = this.getFirstDayOfWeek(date);
    this.arrayDateinMonth.length = 0;
    // console.log(date);
    // console.log(this.getLastDayOfWeek(this.getLastDayofMonth(date)));
    // console.log(this.dateParams);

    while (firstDay <= this.getLastDayOfWeek(this.getLastDayofMonth(date))) {
      this.arrayDateinMonth.push({
        day: firstDay.getDay(),
        date: firstDay.getDate(),
        year: firstDay.getFullYear(),
        month: firstDay.getMonth(),
        full:
          firstDay.getMonth() +
          1 +
          '/' +
          firstDay.getDate() +
          '/' +
          firstDay.getFullYear(),
        localeString: firstDay.toLocaleDateString(),
        dateFull: format(firstDay, 'yyyy-MM-dd'),
      });
      firstDay.setDate(firstDay.getDate() + 1);
    }
  }
  getFirstDayOfWeek(d: any) {
    const date = new Date(d);
    const day = date.getDay();

    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    // console.log(d);

    return new Date(date.setDate(diff));
  }
  getLastDayOfWeek(d: any) {
    const date = new Date(d);
    const day = date.getDay();

    const diff = date.getDate() - day + (day == 0 ? 0 : 7);

    return new Date(date.setDate(diff));
  }
  getLastDayofMonth(last: any) {
    const lastDay = new Date(last);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);

    return lastDay;
  }
  toNextMonth() {
    // this.dateParams = addDays(this.dateParams, 1);
    var date = addMonths(this.dateParams, 1);
    this.dateParams = addMonths(this.dateParams, 1);
    // console.log(date);
    this.loopDate(date);
    // this.showActivity = false;
    // this.router.navigate(['/day'],{
    //   queryParams: { date: date.toLocaleDateString() }});

    // console.log(this.dateParams);
  }
  toPrevMonth() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addMonths(this.dateParams, -1);
    this.dateParams = addMonths(this.dateParams, -1);
    // console.log(date);
    this.loopDate(date);
    // this.showActivity = false;
    // this.router.navigate(['/day', ],{
    //   queryParams: { date: date.toLocaleDateString() }});
    // console.log(this.dateParams);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { addMonths, format } from 'date-fns';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-create-vote',
  templateUrl: './create-vote.component.html',
  styleUrls: ['./create-vote.component.css']
})
export class CreateVoteComponent {
  show:Boolean = true
  stepper = 1;
  participantInput:any

  //Date
  currentDate = new Date();
  dateParams = this.currentDate

  //Array
  arrayDateinMonth:any[] = []
  choosenDate:any[] = []
  nameEmailEmployee:any[] = []
  choosenEmployee:any[] = []

  constructor(private voteService:VoteActivityService, private router:Router,private apiService:ApiService){

  }
  ngOnInit(): void {

    if (this.voteService.subsVar == undefined) {
      this.voteService.subsVar = this.voteService.invokeCreate.subscribe(
        (data: any) => {
          this.callModal(data);
          this.callApiService();
        }
      );
    }
  }

  callModal(data: any) {
    // this.initialForm();
    // console.log(this.authService.getUser()[0].lg_nik);
    this.loopDate(this.currentDate)

    this.show = true;
  }

  callApiService(){
    forkJoin(this.apiService.getNameEmailEmployees()).subscribe((res)=>{
      // console.log(res[0]);
      this.nameEmailEmployee = res[0]
    })
  }
  closeModal() {
    this.show = false;
    this.choosenEmployee = []
    this.choosenDate = []
  }

  onSubmit(){
    
  }

  pushParticipant(){
    console.log(this.participantInput);
    this.choosenEmployee.push(this.participantInput)
    this.participantInput = '' 
  }

  removeChoosenParticipant(date:any){
    this.choosenEmployee = this.choosenEmployee.filter(data=> data != date)
  }

  pushChoosenDate(date:any){
    this.choosenDate.push(date)
    console.log(this.choosenDate);
    
  }

  removeChoosenDate(date:any){
    this.choosenDate = this.choosenDate.filter(data=> data != date)
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
        full: (firstDay.getMonth() + 1) + '/' + firstDay.getDate() + '/' + firstDay.getFullYear(),
        localeString : firstDay.toLocaleDateString(),
        dateFull: format(firstDay,'yyyy-MM-dd')
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

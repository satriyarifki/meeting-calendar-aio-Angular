import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  addHours,
  format,
  addDays,
  addMonths,
  eachHourOfInterval,
  hoursToMilliseconds,
  hoursToMinutes,
  getTime,
} from 'date-fns';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CreateActivityService } from 'src/app/services/create-activity/create-activity.service';
import { EditActivityService } from 'src/app/services/edit-activity/edit-activity.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

const HoursOfDay = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
];
const eachHours = eachHourOfInterval({
  start: new Date(2014, 9, 6, 0),
  end: new Date(2014, 9, 6, 23),
});

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css'],
})
export class DayComponent {
  dateParams = new Date(this.actRoute.snapshot.queryParams['date']);
  dateNow = new Date(this.actRoute.snapshot.queryParams['date']);
  hoursOfDay = eachHours;
  currentDate = new Date();
  showActivity: Boolean = false;
  detailActivity: any;
  deleteAlertBool: Boolean = false;
  idEventOnDelete: any;

  //API
  roomsData: any[] = [];
  dataParticipants: any[] = [];
  arrayDateinMonth: any[] = [];
  eventData: any[] = [];
  m2upData:any[] = []
  eventHoData:any[] = []
  holiDate:any[] = []
  
  constructor(
    private actRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    public authService: AuthService,
    private createService: CreateActivityService,
    private editService: EditActivityService,
    private voteService: VoteActivityService,
    private spinner: NgxSpinnerService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }
  ngOnInit(){
    this.spinner.show()
    this.loopDate(this.dateNow);
    // console.log(authService.getToken());   
    
    forkJoin(
      this.apiService.getEvents(),
      this.apiService.getParticipants(),
      this.apiService.getRooms(),
      this.apiService.getM2UpEmployees(),
      this.apiService.getEventsHoByDate(format(this.dateParams, 'yyyy-MM-dd')),
      // this.apiService.getHolidayByMonthYear(this.dateParams.getMonth()+1, this.dateParams.getFullYear())
    ).subscribe((res) => {
      this.eventData = res[0];
      this.dataParticipants = res[1];
      this.roomsData = res[2];
      this.m2upData = res[3];
      this.eventHoData = res[4]
      // this.holiDate = res[5]
      
      // console.log(this.filterHoliday);
      
      // console.log((this.inBetweenTimeChecker('10')!.minutes/60));
      // console.log(this.filterM2upBirthday(this.dateParams.getMonth(), this.dateParams.getDate()));
      

      this.eventData.sort(function (a, b) {
        return a.time_start >= b.time_start ? 1 : -1; // sort in descending order
      });

      // console.log(this.filterParticipants(1));
    },(err)=>{}, ()=>{this.spinner.hide()});
  }

  get filterHoliday(){
    // console.log(this.holiDate[0]);
    // console.log(this.dateParams.getDate());
    return this.holiDate.filter(elem=>elem.holiday_date.slice(8,10) == this.dateParams.getDate())
  }

  callCreateService(event:any) {
    this.createService.onCallCreateModal(this.dateParams,event);
  }
  callEditService(event:any) {
    this.editService.onCallEditModal(event);
  }
  callVoteService() {
    this.voteService.onCallCreateVote();
  }

  filterEvents(date: any) {
    return this.eventData.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  filterEventsHo(date: any) {
    return this.eventHoData.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  formatDateToTime(date:any){
    return format(new Date(date),'HH:mm')
  }
  
  filterM2upBirthday(month: any, date: any) {
    const dataFilter = this.m2upData.filter(
      (value: any) =>
        new Date(value.date_of_birth).getMonth() == month &&
        new Date(value.date_of_birth).getDate() == date
    );
    
    return dataFilter;
    // console.log(month + 1 + '-' + date + '/n ' + dataFilter);
  }

  foearchM2up(m2up:Array<any>){
    let text = ''
    m2up.forEach((element,i) => {
      if(i==0){
        text += element.employee_name
      } else {
        text += '\n ' + element.employee_name
      }
    });
    return text;
  }
  convertDate(date: any) {
    return (date = new Date(date).toLocaleDateString());
  }
  toNextDay() {
    // this.dateParams = addDays(this.dateParams, 1);
    var date = addDays(this.dateParams, 1);
    this.dateParams = addDays(this.dateParams, 1);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day'],{
      queryParams: { date: date.toLocaleDateString() }});

    // console.log(this.dateParams);
    // console.log(this.filterEvents(this.dateParams).length);
  }
  toPrevDay() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addDays(this.dateParams, -1);
    this.dateParams = addDays(this.dateParams, -1);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day'],{
      queryParams: { date: date.toLocaleDateString() }});
    // console.log(this.dateParams);
  }
  toNextMonth() {
    // this.dateParams = addDays(this.dateParams, 1);
    var date = addMonths(this.dateParams, 1);
    this.dateParams = addMonths(this.dateParams, 1);
    // console.log(date);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day'],{
      queryParams: { date: date.toLocaleDateString() }});

    // console.log(this.dateParams);
  }
  toPrevMonth() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addMonths(this.dateParams, -1);
    this.dateParams = addMonths(this.dateParams, -1);
    // console.log(date);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day', ],{
      queryParams: { date: date.toLocaleDateString() }});
    // console.log(this.dateParams);
  }
  subscribeParticipants() {
    this.apiService.getParticipants().subscribe((data) => {
      this.dataParticipants = data;
    });
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

  changeDatePicker(date: any) {
    // console.log(date);

    this.dateParams = new Date(date);
    var pickDate = new Date(date);
    this.loopDate(pickDate);
    this.router.navigate(['/day'],{
      queryParams: { filter: date.toLocaleDateString() }});
  }
  enterActivityHover() {
    this.showActivity = true;
  }
  leaveActivity() {
    this.showActivity = false;
    this.detailActivity = null;
  }
  filterParticipants(id: any) {
    return this.dataParticipants.filter((data: any) => data.eventId == id);
  }
  filterRoomById(id: any) {
    return this.roomsData.filter((data: any) => data.id == id);
  }
  filterTotalHourExist(hour: any) {
    return this.filterEvents(this.dateParams).filter(
      (data: any) =>
        data.time_end.split(':')[0] == hour ||
        data.time_start.split(':')[0] == hour
    );
  }
  inBetweenTimeChecker(paramHour: any) {
    let result;
    for (const events of this.filterEvents(this.dateParams)) {
      if (
        events.time_start.split(':')[0] <= paramHour &&
        events.time_end.split(':')[0] >= paramHour
      ) {
        if (
          paramHour == events.time_start.split(':')[0] &&
          events.time_start.split(':')[1] != '00'
        ) {
          result = {
            status: true,
            minutesType: 'start',
            minutes: events.time_start.split(':')[1],
          };
          break;
        }

        if (
          paramHour == events.time_end.split(':')[0] &&
          events.time_end.split(':')[1] != '00'
        ) {
          result = {
            status: true,
            minutesType: 'end',
            minutes: events.time_end.split(':')[1],
          };
          break;
        }
        if (
          paramHour == events.time_end.split(':')[0] &&
          events.time_end.split(':')[1] == '00'
        ) {
          result = {
            status: true,
            minutesType: 'end',
            minutes: null,
          };
          break;
        }
        result = {
          status: true,
          minutesType: null,
          minutes: null,
        };
        // console.log('cek');
        break;
      } else {
        result = { status: false };
      }
    }
    return result;
  }
  activityBool(params: any) {
    if (this.showActivity) {
      if (this.detailActivity != params) {
        this.detailActivity = params;
        return;
      }
      this.detailActivity = null;
    } else {
      this.detailActivity = params;
    }
    this.showActivity = !this.showActivity;
  }
  callDeleteAlert(id: any) {
    this.idEventOnDelete = id;
    this.deleteAlertBool = true;
  }
  deleteEvents() {
    this.spinner.show()
    this.apiService.deleteParticipantsByEvent(this.idEventOnDelete).subscribe(
      (response) => {
        // console.log(response + 'Participants Delete Success');
        this.apiService.deleteAttachmentByEventid(this.idEventOnDelete).subscribe(res => {
          // console.log(res + 'Attachments Delete Success');
          this.apiService.deleteEvents(this.idEventOnDelete).subscribe(
            (respons) => {
              // console.log(respons + 'Events Delete Success');
              this.closeDeleteAlert();
              this.spinner.hide()
              window.location.reload();
              
            },
            (err) => {
              console.log(err);
            }
          );
        })
        
        
      },
      (err) => {
        console.log(err);
        this.spinner.hide()
      }
    );
  }
  closeDeleteAlert() {
    this.idEventOnDelete = null;
    this.deleteAlertBool = false;
  }

  signOut() {
    this.authService.signOut();
    window.location.reload();
  }

  onAuthCheck() {
    if (this.authService.getToken() != null) {
      return false;
    }
    return true;
  }
}

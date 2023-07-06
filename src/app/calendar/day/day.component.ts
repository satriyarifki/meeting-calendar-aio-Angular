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
  dateParams = new Date(this.actRoute.snapshot.params['date']);
  dateNow = new Date(this.actRoute.snapshot.params['date']);
  hoursOfDay = eachHours;
  currentDate = new Date();
  showActivity: Boolean = false;
  detailActivity: any;
  deleteAlertBool: Boolean = false;
  idEventOnDelete: any;
  roomsData: any[] = [];
  dataParticipants: any[] = [];
  arrayDateinMonth: any[] = [];
  test: any;
  eventData: any[] = [];
  constructor(
    private actRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    public authService: AuthService,
    private createService: CreateActivityService,
    private editService: EditActivityService
  ) {
    this.loopDate(this.dateNow);
    // console.log(authService.getToken());
    
    forkJoin(
      apiService.getEvents(),
      apiService.getParticipants(),
      apiService.getRooms()
    ).subscribe(([events, participants, rooms]) => {
      this.eventData = events;
      this.dataParticipants = participants;
      this.roomsData = rooms;
      // console.log((this.inBetweenTimeChecker('10')!.minutes/60));

      this.eventData.sort(function (a, b) {
        return a.time_start >= b.time_start ? 1 : -1; // sort in descending order
      });

      // console.log(this.filterParticipants(1));
    });
  }

  callCreateService() {
    this.createService.onCallCreateModal(this.dateParams);
  }
  callEditService(event:any) {
    this.editService.onCallEditModal(event);
  }

  filterEvents(date: any) {
    return this.eventData.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
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
    this.router.navigate(['/day/', date.toLocaleDateString()]);

    // console.log(this.dateParams);
    // console.log(this.filterEvents(this.dateParams).length);
  }
  toPrevDay() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addDays(this.dateParams, -1);
    this.dateParams = addDays(this.dateParams, -1);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day/', date.toLocaleDateString()]);
    // console.log(this.dateParams);
  }
  toNextMonth() {
    // this.dateParams = addDays(this.dateParams, 1);
    var date = addMonths(this.dateParams, 1);
    this.dateParams = addMonths(this.dateParams, 1);
    // console.log(date);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day/', date.toLocaleDateString()]);

    // console.log(this.dateParams);
  }
  toPrevMonth() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addMonths(this.dateParams, -1);
    this.dateParams = addMonths(this.dateParams, -1);
    // console.log(date);
    this.loopDate(date);
    this.showActivity = false;
    this.router.navigate(['/day/', date.toLocaleDateString()]);
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
    this.router.navigate(['/day/', pickDate.toLocaleDateString()]);
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
    this.apiService.deleteParticipantsByEvent(this.idEventOnDelete).subscribe(
      (response) => {
        console.log(response + 'Participants Delete Success');
        this.apiService.deleteAttachmentByEventid(this.idEventOnDelete).subscribe(res => {
          console.log(res + 'Attachments Delete Success');
          this.apiService.deleteEvents(this.idEventOnDelete).subscribe(
            (respons) => {
              console.log(respons + 'Events Delete Success');
              this.closeDeleteAlert();
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

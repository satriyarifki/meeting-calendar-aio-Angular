import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { format, parseISO, hoursToMilliseconds } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AlertType } from 'src/app/services/alert/alert.model';
import { forkJoin } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css'],
})
export class MonthComponent {
  dateParams = new Date(this.actRoute.snapshot.queryParams['date']) ;
  arrayDateinMonth: any[] = [];
  dateChanged = new Date();
  monthSelected = new Date();
  dateAgo = new Date();
  currentDate = new Date();
  endDate = new Date();
  lastDateMonth!: Date;
  detailsActivity: Boolean = false;
  title: any;

  //API
  eventData: any[] = [];
  m2upData: any[] = [];
  eventHoData: any[] = [];
  holiDate: any[] = [];

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private actRoute: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    spinner.show();
    this.endDate.setMonth(this.currentDate.getMonth() + 2);
    this.dateAgo.setDate(this.currentDate.getDate() - 14);

    if (isFinite(+this.dateParams)) {
      this.monthSelected = this.dateParams;
      this.loopDate(this.dateParams);
    } else {
      this.dateParams = this.dateChanged
      this.loopDate(this.dateChanged);
    }
    console.log(this.dateParams.getMonth() + 1);
    
    forkJoin(
      apiService.getEvents(),
      apiService.getM2UpEmployees(),
      apiService.getEventsHo(),
      apiService.getHolidayByMonthYear(
        this.dateParams.getMonth() + 1 ,
        this.dateParams.getFullYear() 
      )
    ).subscribe(
      (res) => {
        this.eventData = res[0];
        this.m2upData = res[1];
        this.eventHoData = res[2];
        this.holiDate = res[3];
        spinner.hide()
      },
      () => {
        spinner.hide();
      },
      () => {
        spinner.hide();
      }
    );
  }
  filterEvents(date: any) {
    return this.eventData.filter(
      (data: any) => this.convertDate(data.date) == date
    );
  }
  convertDate(date: any) {
    return (date = new Date(date).toLocaleDateString());
  }
  formatTime(time: any) {
    // console.log(time);

    return format(new Date(), 'kk:mm');
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
  filterEventHo(year: any, month: any, date: any) {
    const dataFilter = this.eventHoData.filter(
      (value: any) =>
        new Date(value.start_time).getFullYear() == year &&
        new Date(value.start_time).getMonth() == month &&
        new Date(value.start_time).getDate() == date
    );

    return dataFilter;
    // console.log(month + 1 + '-' + date + '/n ' + dataFilter);
  }

  foearchM2up(m2up: Array<any>) {
    let text = '';
    m2up.forEach((element, i) => {
      if (i == 0) {
        text += element.employee_name;
      } else {
        text += '\n ' + element.employee_name;
      }
    });
    return text;
  }

  // Get 1 Month Date
  loopDate(date: any) {
    var firstDay = date;
    firstDay.setDate(1);
    firstDay = this.getFirstDayOfWeek(date);
    this.arrayDateinMonth.length = 0;
    // console.log(date);
    // console.log(this.getLastDayOfWeek(this.getLastDayofMonth(date)));

    while (firstDay <= this.getLastDayOfWeek(this.getLastDayofMonth(date))) {
      this.arrayDateinMonth.push({
        date: formatDate(firstDay,'dd','EN-US'),
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
        formFormat: formatDate(firstDay,'yyyy-MM-d','EN-US')
      });

      firstDay.setDate(firstDay.getDate() + 1);
    }
  }

  filterHoliday(date: any) {
    
    return this.holiDate.filter(
      (elem) => elem.tanggal == date && elem.cuti == false
    );
  }
  getFirstDayOfWeek(d: any) {
    // 👇️ clone date object, so we don't mutate it
    const date = new Date(d);
    const day = date.getDay(); // 👉️ get day of week

    // 👇️ day of month - day of week (-6 if Sunday), otherwise +1
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    // console.log(d);

    return new Date(date.setDate(diff));
  }
  getLastDayOfWeek(d: any) {
    // 👇️ clone date object, so we don't mutate it

    const date = new Date(d);
    const day = date.getDay(); // 👉️ get day of week

    // 👇️ day of month - day of week (-6 if Sunday), otherwise +1
    const diff = date.getDate() - day + (day == 0 ? 0 : 7);

    return new Date(date.setDate(diff));
  }
  getLastDayofMonth(last: any) {
    const lastDay = new Date(last);
    lastDay.setMonth(lastDay.getMonth() + 1); // This is the wrong way to do it.
    lastDay.setDate(0);

    return lastDay;
  }
  nextMonth() {
    // console.log('next');

    this.monthSelected.setMonth(this.monthSelected.getMonth() + 1);
    this.router.navigate([], {
      relativeTo: this.actRoute,
      queryParams: { date: this.monthSelected.toLocaleDateString() },
    });
    this.loopDate(this.monthSelected);
  }
  previousMonth() {
    // console.log('prev');
    this.monthSelected.setMonth(this.monthSelected.getMonth() - 1);
    this.router.navigate([], {
      relativeTo: this.actRoute,
      queryParams: { date: this.monthSelected.toLocaleDateString() },
    });
    this.loopDate(this.monthSelected);
  }

  enterActivityHover() {
    this.detailsActivity = true;
  }
  leaveActivityHover() {
    this.detailsActivity = false;
  }
  activityBool() {
    this.detailsActivity = !this.detailsActivity;
  }

  signOut() {
    this.authService.signOut();
    // window.location.reload();
    this.alertService.onCallAlert('log Out Success', AlertType.Success);
  }

  onAuthCheck() {
    if (this.authService.getToken() != null) {
      return false;
    }
    return true;
  }
}

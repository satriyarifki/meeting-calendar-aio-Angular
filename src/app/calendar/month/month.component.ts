import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { format, parseISO, hoursToMilliseconds } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css'],
})
export class MonthComponent {
  arrayDateinMonth: any[] = [];
  dateChanged = new Date();
  monthSelected = new Date();
  dateAgo = new Date();
  currentDate = new Date();
  endDate = new Date();
  lastDateMonth!: Date;
  detailsActivity: Boolean = false;
  title: any;
  eventData: any[] = [];
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.endDate.setMonth(this.currentDate.getMonth() + 2);
    this.dateAgo.setDate(this.currentDate.getDate() - 14);

    this.loopDate(this.dateChanged);

    apiService.getEvents().subscribe((data) => {
      this.eventData = data;
      // console.log(this.formatTime(this.eventData[0].time_start));
    });
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
    console.log(time);

    return format(new Date(), 'kk:mm');
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
        date: firstDay.getDate(),
        year: firstDay.getFullYear(),
        month: firstDay.getMonth(),
        full: firstDay.toLocaleDateString(),
      });
      firstDay.setDate(firstDay.getDate() + 1);
    }
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
    console.log('next');

    this.monthSelected.setMonth(this.monthSelected.getMonth() + 1);
    this.loopDate(this.monthSelected);
  }
  previousMonth() {
    console.log('prev');
    this.monthSelected.setMonth(this.monthSelected.getMonth() - 1);

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
    window.location.reload();
  }

  onAuthCheck() {
    if (this.authService.getToken() != null) {
      return false;
    }
    return true;
  }
}

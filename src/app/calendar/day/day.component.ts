import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { addHours, format, addDays, addMonths } from 'date-fns';
import { ApiService } from 'src/app/services/api.service';

const HoursOfDay = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23, 24,
];

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css'],
})
export class DayComponent {
  dateParams = new Date(this.actRoute.snapshot.params['date']);
  dateNow = new Date(this.actRoute.snapshot.params['date']);
  hoursOfDay = HoursOfDay;
  currentDate = new Date();
  arrayDateinMonth: any[] = [];
  test: any;
  eventData: any[] = [];
  constructor(
    private actRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loopDate(this.dateNow);

    apiService.getEvents().subscribe((data) => {
      this.eventData = data;
      console.log(this.filterEvents(this.dateParams).length);
    });
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
    this.router.navigate(['/day/', date.toLocaleDateString()]);

    // console.log(this.dateParams);
    console.log(this.filterEvents(this.dateParams).length);
  }
  toPrevDay() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addDays(this.dateParams, -1);
    this.dateParams = addDays(this.dateParams, -1);
    this.loopDate(date);
    this.router.navigate(['/day/', date.toLocaleDateString()]);
    // console.log(this.dateParams);
  }
  toNextMonth() {
    // this.dateParams = addDays(this.dateParams, 1);
    var date = addMonths(this.dateParams, 1);
    this.dateParams = addMonths(this.dateParams, 1);
    // console.log(date);
    this.loopDate(date);
    this.router.navigate(['/day/', date.toLocaleDateString()]);

    // console.log(this.dateParams);
  }
  toPrevMonth() {
    // this.dateParams = addDays(this.dateParams, -1);
    var date = addMonths(this.dateParams, -1);
    this.dateParams = addMonths(this.dateParams, -1);
    // console.log(date);
    this.loopDate(date);
    this.router.navigate(['/day/', date.toLocaleDateString()]);
    // console.log(this.dateParams);
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
        full: firstDay.toLocaleDateString(),
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
}

import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  arrayDateinMonth: any[] = [];
  dateChanged = new Date();
  monthSelected = new Date();
  dateAgo = new Date();
  currentDate = new Date();
  endDate = new Date();
  lastDateMonth!: Date;
  title: any;
  constructor() {
    this.endDate.setMonth(this.currentDate.getMonth() + 2);
    this.dateAgo.setDate(this.currentDate.getDate() - 14);
    // console.log(this.getLastDayofMonth(this.currentDate).getDay());
    // console.log(this.getFirstDayOfWeek(this.dateAgo));

    this.loopDate(this.dateChanged);
    // console.log(this.arrayDateinMonth);
  }
  loopDate(date: any) {
    var firstDay = date;
    firstDay.setDate(1);
    firstDay = this.getFirstDayOfWeek(date);
    this.arrayDateinMonth.length = 0;
    // console.log(date);
    // console.log(this.getLastDayOfWeek(this.getLastDayofMonth(date)));

    while (firstDay <= this.getLastDayOfWeek(this.getLastDayofMonth(date))) {
      this.arrayDateinMonth.push({date: firstDay.getDate(), year: firstDay.getFullYear(), month: firstDay.getMonth() });
      firstDay.setDate(firstDay.getDate() + 1);

      // console.log(date);
      // console.log(date.toLocaleString('en-us', { weekday: 'long' }));
    }
    
  }
  getFirstDayOfWeek(d: any) {
    // 👇️ clone date object, so we don't mutate it
    const date = new Date(d);
    const day = date.getDay(); // 👉️ get day of week

    // 👇️ day of month - day of week (-6 if Sunday), otherwise +1
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    console.log(d);
    
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
    const lastDay = new Date(last)
    lastDay.setMonth(lastDay.getMonth() + 1); // This is the wrong way to do it.
    lastDay.setDate(0);
   
    
    return lastDay;
  }
  nextMonth() {
    console.log('next');

    this.monthSelected.setMonth(this.monthSelected.getMonth() + 1);
    // console.log(this.monthSelected);
    this.loopDate(this.monthSelected);
  }
  previousMonth() {
    console.log('prev');
    // console.log(this.monthSelected.getMonth());
    this.monthSelected.setMonth(this.monthSelected.getMonth() - 1);
    // console.log(this.monthSelected.getMonth());

    this.loopDate(this.monthSelected);
  }
}

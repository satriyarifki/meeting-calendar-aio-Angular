import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerModule } from 'angular-calendar-scheduler';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { MonthComponent } from './calendar/month/month.component';
import { WeekComponent } from './calendar/week/week.component';
import { SigninComponent } from './auth/signin/signin.component';
import { CreateComponent } from './activity/create/create.component';
import { HomeComponent } from './home/home.component';
import { DayComponent } from './calendar/day/day.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    MonthComponent,
    WeekComponent,
    SigninComponent,
    CreateComponent,
    HomeComponent,
    DayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' }),
    FormsModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'en-US' }],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SchedulerModule } from 'angular-calendar-scheduler';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonthComponent } from './calendar/month/month.component';
import { WeekComponent } from './calendar/week/week.component';
import { SigninComponent } from './auth/signin/signin.component';
import { CreateComponent } from './activity/create/create.component';
import { HomeComponent } from './home/home.component';
import { DayComponent } from './calendar/day/day.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LoginComponent } from './auth/login/login.component';
import { AlertComponent } from './alert/alert.component';
import { EditComponent } from './activity/edit/edit.component';

@NgModule({
  declarations: [
    AppComponent,
    MonthComponent,
    WeekComponent,
    SigninComponent,
    CreateComponent,
    HomeComponent,
    DayComponent,
    LoginComponent,
    AlertComponent,
    EditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    SchedulerModule.forRoot({ locale: 'en', headerDateFormat: 'daysRange' }),
    FormsModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}

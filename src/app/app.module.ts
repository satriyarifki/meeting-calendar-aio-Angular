import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileUploadModule } from 'ng2-file-upload';
import { TooltipDirective } from './directive/tooltip/tooltip.directive';
import { NgxSpinnerModule } from "ngx-spinner";
import { FooterComponent } from './layouts/footer/footer.component';
import { CreateVoteComponent } from './vote/create-vote/create-vote.component';
import { ViewVoteComponent } from './vote/view-vote/view-vote.component';
import { SubmitVoteComponent } from './vote/submit-vote/submit-vote.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { DeleteApiComponent } from './layouts/delete-api/delete-api.component';

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
    TooltipDirective,
    FooterComponent,
    CreateVoteComponent,
    ViewVoteComponent,
    SubmitVoteComponent,
    NavbarComponent,
    DeleteApiComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    FileUploadModule,
    NgxSpinnerModule,
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}

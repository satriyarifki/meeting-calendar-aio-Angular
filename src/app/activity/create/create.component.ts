import { Component, OnInit } from '@angular/core';
import { addHours, format, addDays, addMonths } from 'date-fns';
import { CreateActivityService } from 'src/app/services/create-activity/create-activity.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe, formatDate } from '@angular/common';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AlertType } from 'src/app/services/alert/alert.model';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
  radioInput: any;
  show: Boolean = false;
  submitted: Boolean = false;
  initialDate!: Date;
  arrayParicipants: Array<String> = [];
  roomsAll: any;
  form!: FormGroup;
  eventDatas: any;
  constructor(
    private createService: CreateActivityService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private datePipe: DatePipe
  ) {
    apiService.getEvents().subscribe((data) => {
      this.eventDatas = data;
    });
    if (this.createService.subsVar == undefined) {
      this.createService.subsVar = this.createService.invokeAlert.subscribe(
        (date) => {
          this.callModal(date.date);
        }
      );
    }
  }
  get f() {
    return this.form.controls;
  }
  callModal(date: any) {
    this.initialDate = date;
    this.initialForm();

    this.show = true;
  }
  closeModal() {
    this.show = false;
  }
  convertDate(date: any) {
    return (date = new Date(date).toLocaleDateString());
  }

  filterEvents(date: any) {
    return this.eventDatas.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  inBetweenTimeChecker(startHour: any, endHour: any, date: any) {
    let result = true;

    for (const events of this.filterEvents(date)) {
      console.log(events.time_start.slice(0, -3));

      if (
        (events.time_start.slice(0, -3) <= startHour &&
          events.time_end.slice(0, -3) >= startHour) ||
        (events.time_start.slice(0, -3) <= endHour &&
          events.time_end.slice(0, -3) >= endHour)
      ) {
        console.log(date + ' ' + startHour + ' ' + endHour);

        result = false;
        break;
      }
    }
    console.log(result);

    return result;
  }

  ngOnInit(): void {
    this.apiService.getRooms().subscribe((data) => {
      this.roomsAll = data;
      // console.log(data);
    });
  }
  initialForm() {
    this.form = this.formBuilder.group({
      userId: [''],
      date: [format(this.initialDate, 'yyyy-MM-dd'), Validators.required],
      time_start: ['', Validators.required],
      time_end: ['', Validators.required],
      title: ['', Validators.required],
      organizer: ['', Validators.required],
      description: [''],
      online_offline: ['', Validators.required],
      url_online: [''],
      roomId: [''],
      participants: ['', Validators.required],
      message: ['', Validators.required],
    });
  }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      return;
    }
    if (
      !this.inBetweenTimeChecker(
        this.f['time_start'].value,
        this.f['time_end'].value,
        this.f['date'].value
      )
    ) {
      this.alertService.onCallAlert(
        'Time Booked, Choose Another!',
        AlertType.Error
      );

      return;
    }

    this.f['userId'].setValue(1);

    let body = {
      userId: this.f['userId'].value,
      date: this.f['date'].value,
      time_start: this.f['time_start'].value,
      time_end: this.f['time_end'].value,
      title: this.f['title'].value,
      organizer: this.f['organizer'].value,
      description: this.f['description'].value,
      online_offline: this.f['online_offline'].value,
      url_online: this.f['url_online'].value,
      roomId: this.f['roomId'].value,
      // participants: this.f['participants'].value,
      message: this.f['message'].value,
    };
    let email = {
      date: this.f['date'].value,
      organizer: this.f['organizer'].value,
      participants: this.f['participants'].value,
      message: this.f['message'].value,
    };
    if (body.online_offline == 'Online') {
      body.roomId = 1;
    }

    // console.log(email.message);

    this.arrayParicipants = this.f['participants'].value
      .replace(/\s/g, '')
      .split(',');
    // console.log(body);

    this.apiService.postEvents(body).subscribe(
      (data) => {
        // console.log(data.id);

        // this.alertServie.onCallAlert('Success Add Data', AlertType.Success)
        // this.router.navigate(['/dashboard/users']);
        this.arrayParicipants.forEach((element) => {
          this.apiService
            .postParticipants({
              eventId: data.id,
              email: element,
            })
            .subscribe(
              (subs) => {
                this.closeModal();
                this.alertService.onCallAlert(
                  'Create Meeting Success!',
                  AlertType.Success
                );
                window.location.reload();
              },
              (err) => {
                console.log(err);
              }
            );
        });
        // this.apiService.sendEmail(email).subscribe(
        //   (em) => {
        //     console.log('Email sent Success');
        //   },
        //   (err) => {
        //     console.log('Email Failed');
        //   }
        // );
        this.submitted = false;
      },
      (err) => {
        console.log('Error');
        // this.alertServie.setAlert('Add Data Failed', AlertType.Error)
        console.log(err);
        this.submitted = false;
      }
    );
  }
}

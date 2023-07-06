import { Component, OnInit } from '@angular/core';
import { addHours, format, addDays, addMonths } from 'date-fns';
import { FileUploader } from 'ng2-file-upload';
import { CreateActivityService } from 'src/app/services/create-activity/create-activity.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe, formatDate } from '@angular/common';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AlertType } from 'src/app/services/alert/alert.model';
import { forkJoin, map, Observable, startWith } from 'rxjs';
const URL = 'http://127.0.0.1:3555/upload';

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
  options: string[] = ['link One', 'link Two', 'link Three'];
  emailList: string[] = [
    'rifkisatriya@gmail.com',
    'satriaveiro@gmail.com',
    'lazuardi@gmail.com',
  ];
  //API
  emailsEmployee: any;
  roomsAll: any;
  eventDatas: any;

  //FORM
  form!: FormGroup;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'files',
    additionalParameter: { dataId: 1, mail: null },
  });

  constructor(
    private createService: CreateActivityService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private datePipe: DatePipe
  ) {}
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
      emailDirectSend: [false, Validators.required],
    });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      console.log('Uploaded File Details:', item);
      this.alertService.onCallAlert('Upload Success!', AlertType.Success);
    };
  }
  get f() {
    return this.form?.controls;
  }
  callModal(date: any) {
    this.initialDate = date;
    this.initialForm();

    this.show = true;
  }
  closeModal() {
    this.uploader.clearQueue();
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
      if (
        events.time_start.slice(0, -3) > startHour &&
        events.time_start.slice(0, -3) < endHour
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
    forkJoin(
      this.apiService.getEmailEmployees(),
      this.apiService.getRooms(),
      this.apiService.getEvents()
    ).subscribe(([emails, rooms, events]) => {
      this.emailsEmployee = emails;
      this.roomsAll = rooms;
      this.eventDatas = events;
    });
    if (this.createService.subsVar == undefined) {
      this.createService.subsVar = this.createService.invokeAlert.subscribe(
        (date) => {
          this.callModal(date.date);
        }
      );
    }
  }
  inputFileChange(event: any) {
    console.log(event);
  }

  onSubmit() {
    this.submitted = true;
    console.log(this.uploader);
    this.uploader.options.additionalParameter = { dataId: 2 };
    console.log(this.uploader.options.additionalParameter);

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
      participants: this.f['participants'].value,
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

    // this.arrayParicipants = this.f['participants'].value
    //   .replace(/\s/g, '')
    //   .split(',');
    // console.log(body);
    this.apiService.postEvents(body).subscribe(
      (data) => {
        // console.log(data.id);

        // this.alertServie.onCallAlert('Success Add Data', AlertType.Success)
        // this.router.navigate(['/dashboard/users']);
        // this.arrayParicipants.forEach((element) => {
        this.apiService
          .postParticipants({
            eventId: data.id,
            email: email.participants,
          })
          .subscribe(
            (subs) => {
              this.closeModal();
              this.alertService.onCallAlert(
                'Create Meeting Success!',
                AlertType.Success
              );
              // this.ngOnInit();
              // window.location.reload();
            },
            (err) => {
              console.log(err);
            }
          );
        // });
        if (this.uploader.queue.length > 0) {
          if (this.f['emailDirectSend'].value) {
            this.uploader.options.additionalParameter = {
              dataId: data.id,
              date: this.f['date'].value,
              organizer: this.f['organizer'].value,
              participants: this.f['participants'].value,
              message: this.f['message'].value,
            };
            console.log(this.uploader.options.additionalParameter);

            this.uploader.uploadAll();
            console.log('Up + Email');
          } else {
            this.uploader.options.additionalParameter = { dataId: data.id };
            this.uploader.uploadAll();
            console.log('Up');
          }
        } else {
          if (this.f['emailDirectSend'].value) {
            console.log('Sent Email');

            this.apiService.sendEmail(email).subscribe(
              (em) => {
                console.log('Email sent Success');
              },
              (err) => {
                console.log('Email Failed');
              }
            );
          }
        }

        this.ngOnInit();
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

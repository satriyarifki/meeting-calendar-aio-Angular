import { Component, OnInit } from '@angular/core';
import {
  addHours,
  format,
  addDays,
  addMonths,
  differenceInMinutes,
  set,
  areIntervalsOverlapping,
} from 'date-fns';
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
import { AuthService } from 'src/app/services/auth/auth.service';
const URL = 'http://127.0.0.1:3555/upload';

const listLink = [
  {
    name: 'Monthly Sharing Session',
    link: 'http://bit.ly/MonthlySharingsession',
  },
  {
    name: 'Weekly Morning Meeting Kejayan',
    link: 'https://bit.ly/weeklyAIOKejayan',
  },
  {
    name: 'Weekly Morning Meeting Sukabumi',
    link: 'https://bit.ly/FactoryWMMSkb',
  },
  { name: 'Periodic Energy Meeting  ', link: 'http://bit.ly/MeetingEHSKJY' },
  { name: 'Training HCD', link: 'https://bit.ly/TrainingHCDAIO' },
  { name: 'CRP Meeting', link: 'https://bit.ly/CRPKEJAYAN ' },
];

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
  listLink = listLink;
  //API
  emailsEmployee: any;
  nameEmailEmployee: any;
  roomsAll: any;
  eventDatas: any;
  reservs: any;

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
    private authService: AuthService,
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
    // console.log(this.authService.getUser()[0].lg_nik);

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
      // console.log(events.time_start.slice(0, -3));

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
      this.apiService.getEvents(),
      this.apiService.getNameEmailEmployees(),
      this.apiService.reservGet()
    ).subscribe(([emails, rooms, events, nameEmail, reserv]) => {
      this.emailsEmployee = emails;
      this.nameEmailEmployee = nameEmail;
      this.roomsAll = rooms;
      this.eventDatas = events;
      this.reservs = reserv;
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
  filterReservByDate(date: any) {
    let reservbyDate = this.reservs.filter(
      (data: any) => data.begin.slice(0, 10) == date
    );
    // console.log(reservbyDate);
    // console.log(set(date,{hours:}));

    // return reservbyDate;
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
    // if (
    //   !this.inBetweenTimeChecker(
    //     this.f['time_start'].value,
    //     this.f['time_end'].value,
    //     this.f['date'].value
    //   )
    // ) {
    //   this.alertService.onCallAlert(
    //     'Time Booked, Choose Another!',
    //     AlertType.Error
    //   );

    //   return;
    // }

    // this.f['userId'].setValue(1);

    let body = {
      userId: this.authService.getUser()[0].lg_nik,
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
    let bodyReserv = {
      userId: this.authService.getUser()[0].lg_nik,
      resourceId: this.f['roomId'].value - 1,
      begin: set(new Date(body.date), {
        hours: body.time_start.slice(0, 2),
        minutes: body.time_start.slice(3, 5),
      }),
      end: set(new Date(body.date), {
        hours: body.time_end.slice(0, 2),
        minutes: body.time_end.slice(3, 5),
      }),
      length:
        differenceInMinutes(
          set(new Date(body.date), {
            hours: body.time_end.slice(0, 2),
            minutes: body.time_end.slice(3, 5),
          }),
          set(new Date(body.date), {
            hours: body.time_start.slice(0, 2),
            minutes: body.time_start.slice(3, 5),
          })
        ) / 60,
      repeat: false,
      title: this.f['title'].value,
      description: this.f['message'].value,
    };

    if (
      body.online_offline == 'Offline' &&
      this.isOverlappingTime(
        bodyReserv.begin,
        bodyReserv.end,
        bodyReserv.resourceId
      )
    ) {
      return;
    } else if (body.online_offline == 'Online') {
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
    }
    let bodyAcs = {
      reservationId: 0,
      laptop: false,
      panaboard: false,
      papanTulis: false,
      projector: false,
      pocari: false,
      soyjoy: false,
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
        if (body.online_offline == 'Offline') {
          if (bodyReserv.begin == null) {
            console.log('stop');

            return;
          }
          this.apiService.reservPost(bodyReserv).subscribe(
            (data) => {
              // console.log(data);
              bodyAcs.reservationId = data.id;
              this.apiService.accessoriesPost(bodyAcs).subscribe(
                (elem) => {
                  // console.log(elem);
                  this.alertService.onCallAlert(
                    'Booked Reservation Success!',
                    AlertType.Success
                  );
                  // this.router.navigate(['/']);
                },
                (er) => {
                  // console.log(er);

                  this.alertService.onCallAlert(
                    'Booked Reservation Fail!',
                    AlertType.Error
                  );
                }
              );
            },
            (err) => {
              // console.log(err);

              this.alertService.onCallAlert(
                'Booked Reservation Fail!',
                AlertType.Error
              );
            }
          );
        }

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

  isOverlappingTime(begin: any, end: any, resourceId: any) {
    let bool = false;
    let reservation = this.reservs.filter(
      (data: any) =>
        format(new Date(data.begin), 'P') == format(new Date(begin), 'P') &&
        data.resourceId == resourceId
    );
    try {
      if (reservation.length != 0) {
        // if (new Date(begin) > new Date(end)) {
        //   return;
        // } else {
        reservation.forEach((element: any) => {
          if (
            areIntervalsOverlapping(
              {
                start: new Date(element.begin),
                end: new Date(element.end),
              },
              { start: begin, end: end }
            )
          ) {
            bool = true;
            this.alertService.onCallAlert(
              'Date & Resource Booked in MRIS! Choose Another!',
              AlertType.Error
            );
            return;
          }
        });
        // }
      }
    } catch (error) {
      console.log('hh' + error);
      bool = true;
      this.alertService.onCallAlert(
        'Fill Begin and End Correctly!',
        AlertType.Error
      );
      return bool;
    }

    return bool;
  }
}

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
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
import { DatePipe, formatDate } from '@angular/common';
import { AlertService } from 'src/app/services/alert/alert.service';
import { AlertType } from 'src/app/services/alert/alert.model';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
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
  participantsApi:any[] = []

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
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private router: Router
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
  duplicateForm(event:any) {
    this.form = this.formBuilder.group({
      userId: [event.userId, Validators.required],
      date: [
        format(new Date(event.date), 'yyyy-MM-dd'),
        Validators.required,
      ],
      time_start: [event.time_start, Validators.required],
      time_end: [event.time_end, Validators.required],
      title: [event.title, Validators.required],
      organizer: [event.organizer, Validators.required],
      description: [''],
      online_offline: [event.online_offline, Validators.required],
      url_online: [event.url_online],
      roomId: [event.roomId],
      participants: [
        this.joinParticipantById(event.id),
        Validators.required,
      ],
      message: [event.message, Validators.required],
      emailDirectSend: [false, Validators.required],
    });
    this.radioInput = event.online_offline;
    
  }
  ngOnInit(): void {
    forkJoin(
      this.apiService.getEmailEmployees(),
      this.apiService.getRooms(),
      this.apiService.getEvents(),
      this.apiService.getNameEmailEmployees(),
      this.apiService.reservGet(),
      this.apiService.getParticipants(),
    ).subscribe(([emails, rooms, events, nameEmail, reserv,parti]) => {
      this.emailsEmployee = emails;
      this.nameEmailEmployee = nameEmail;
      this.roomsAll = rooms;
      this.eventDatas = events;
      this.reservs = reserv;
      this.participantsApi = parti
    });

    if (this.createService.subsVar == undefined) {
      this.createService.subsVar = this.createService.invokeAlert.subscribe(
        (data) => {
          this.callModal(data);
        }
      );
    }
  }
  get f() {
    return this.form?.controls;
  }
  callModal(data: any) {
    this.initialDate = data.date;
    if(data.event != 0 && data.event != null){
      this.duplicateForm(data.event)
    } else {
      this.initialForm();
    }
    // console.log(this.authService.getUser().lg_nik);

    this.show = true;
  }
  closeModal() {
    this.uploader.clearQueue();
    this.form.reset();
    this.show = false;
  }

  joinParticipantById(id: any) {
    var par: String[] = [];
    this.participantsApi
      .filter((data: any) => data.eventId == id)
      .forEach((element: any) => {
        par.push(element.email);
      });
    return par.join(', ');
  }
  convertDate(date: any) {
    return (date = new Date(date).toLocaleDateString());
  }

  filterEvents(date: any) {
    return this.eventDatas.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  filterEventsByLink(date: any, link: any) {
    return this.eventDatas.filter(
      (data: any) =>
        this.convertDate(data.date) == this.convertDate(date) &&
        data.url_online == link
    );
  }

  inBetweenTimeChecker(startHour: any, endHour: any, date: any, link: any) {
    let result = true;

    for (const events of this.filterEventsByLink(date, link)) {
      // console.log(events.time_start.slice(0, -3));

      if (
        (events.time_start.slice(0, -3) <= startHour &&
          events.time_end.slice(0, -3) >= startHour) ||
        (events.time_start.slice(0, -3) <= endHour &&
          events.time_end.slice(0, -3) >= endHour)
      ) {
        // console.log(date + ' ' + startHour + ' ' + endHour);

        result = false;
        break;
      }
      if (
        events.time_start.slice(0, -3) > startHour &&
        events.time_start.slice(0, -3) < endHour
      ) {
        // console.log(date + ' ' + startHour + ' ' + endHour);

        result = false;
        break;
      }
    }
    // console.log(result);

    return result;
  }

  
  inputFileChange(event: any) {
    // console.log(event);
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
    this.spinner.show();
    this.submitted = true;
    // console.log(this.uploader);
    this.uploader.options.additionalParameter = { dataId: 2 };
    // console.log(this.uploader.options.additionalParameter);

    if (this.form.invalid) {
      // console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      this.spinner.hide();
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
    console.log();
    
    let body = {
      userId: this.authService.getUser()?.lg_nik,
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
      userId: this.authService.getUser().lg_nik,
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
    // console.log(body);

    if (body.online_offline == 'Offline') {
      if (
        this.isOverlappingTime(
          bodyReserv.begin,
          bodyReserv.end,
          bodyReserv.resourceId
        )
      ) {
        this.spinner.hide();
        return;
      }
    } else if (body.online_offline == 'Online') {
      if (
        !this.inBetweenTimeChecker(
          this.f['time_start'].value,
          this.f['time_end'].value,
          this.f['date'].value,
          body.url_online
        )
      ) {
        this.alertService.onCallAlert(
          'Time & Link Booked, Choose Another!',
          AlertType.Error
        );
        this.spinner.hide();
        return;
      }
    } else {
      if (
        !this.inBetweenTimeChecker(
          this.f['time_start'].value,
          this.f['time_end'].value,
          this.f['date'].value,
          body.url_online
        ) ||
        this.isOverlappingTime(
          bodyReserv.begin,
          bodyReserv.end,
          bodyReserv.resourceId
        )
      ) {
        this.alertService.onCallAlert(
          'Time Or Resource Room Already Booked, Choose Another!',
          AlertType.Error
        );
        this.spinner.hide();
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
      organizer:
        this.nameEmailEmployee[
          this.emailsEmployee.indexOf(this.f['organizer'].value)
        ],
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
              this.ngOnInit();
              if (body.online_offline == 'Online') {
                this.router.onSameUrlNavigation = 'reload';
                this.router.navigateByUrl(this.router.url);
              }

              // window.location.reload();
            },
            (err) => {
              console.log(err);
            }
          );
        // });
        if (
          body.online_offline == 'Offline' ||
          body.online_offline == 'Hybrid'
        ) {
          if (bodyReserv.begin == null) {
            // console.log('stop');

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
                    'Meeting Reservation Success!',
                    AlertType.Success
                  );
                  this.router.onSameUrlNavigation = 'reload';
                  this.router.navigateByUrl(this.router.url);
                  // this.router.navigate(['/']);
                },
                (er) => {
                  // console.log(er);
                  setTimeout(() => {
                    this.alertService.onCallAlert(
                      'Booked Reservation Fail!',
                      AlertType.Error
                    );
                  }, 3000);
                }
              );
            },
            (err) => {
              // console.log(err);
              this.spinner.hide();
              setTimeout(() => {
                this.alertService.onCallAlert(
                  'Booked Reservation Fail!',
                  AlertType.Error
                );
              }, 3000);
            },
            () => {}
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
            // console.log(this.uploader.options.additionalParameter);

            this.uploader.uploadAll();
            // console.log('Up + Email');
          } else {
            this.uploader.options.additionalParameter = { dataId: data.id };
            this.uploader.uploadAll();
            // console.log('Up');
          }
        } else {
          if (this.f['emailDirectSend'].value) {
            console.log('Sent Email');
            // console.log(email);

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

        // setTimeout(() => {
        //   window.location.reload();
        // }, 5000);
        this.submitted = false;
      },
      (err) => {
        // console.log('Error');
        this.spinner.hide();
        this.alertService.onCallAlert(
          'Create Meeting Fail!',
          AlertType.Error
        );
        // this.alertServie.setAlert('Add Data Failed', AlertType.Error)
        console.log(err);
        this.submitted = false;
      },
      () => {
        this.spinner.hide();
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

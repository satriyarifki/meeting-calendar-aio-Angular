import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  areIntervalsOverlapping,
  differenceInMinutes,
  format,
  set,
} from 'date-fns';
import { FileItem, FileUploader } from 'ng2-file-upload';
import { filter, forkJoin, timeout } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { EditActivityService } from 'src/app/services/edit-activity/edit-activity.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DayComponent } from 'src/app/calendar/day/day.component';
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
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  providers: [DayComponent]
})
export class EditComponent {
  radioInput: any;
  show: Boolean = false;
  submitted: Boolean = false;
  initialEvent!: any;
  arrayParicipants: Array<String> = [];
  listLink = listLink;

  // API
  roomsApi: any;
  participantsApi: any;
  eventApi: any;
  emailsEmployee: any;
  nameEmailEmployee: any;
  attachApi: any;
  reservsApi: any;

  //FORM
  form!: FormGroup;

  //Upload
  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'files',
    additionalParameter: { dataId: 1 },
  });

  constructor(
    private editService: EditActivityService,
    private apiService: ApiService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private router: Router,
    private spinner: NgxSpinnerService,
    private dayComp: DayComponent
  ) {
    if (this.editService.subsVar == undefined) {
      // spinner.show();
      this.editService.subsVar = this.editService.invokeAlert.subscribe(
        (event: any) => {
          this.spinner.show();
          this.callModal(event);
        },
        (err) => {},
        () => {
          // spinner.hide();
        }
      );
    }
  }
  ngOnInit(): void {
    forkJoin([
      this.apiService.getEvents(),
      this.apiService.getParticipants(),
      this.apiService.getRooms(),
      this.apiService.getEmailEmployees(),
      this.apiService.getNameEmailEmployees(),
      this.apiService.reservGet(),
    ]).subscribe(
      ([events, participants, rooms, emails, nameEmail, reserv]) => {
        this.eventApi = events;
        this.roomsApi = rooms;
        this.participantsApi = participants;
        // console.log(this.participantsApi);

        this.emailsEmployee = emails;
        this.nameEmailEmployee = nameEmail;
        this.reservsApi = reserv;
      },
      (err) => {},
      () => {}
    );
  }
  get f() {
    return this.form.controls;
  }
  callModal(event: any) {
    this.initialEvent = event.id;
    this.initialForm();

    this.show = true;
    this.spinner.hide();
  }
  closeModal() {
    this.uploader.clearQueue();
    this.show = false;
  }
  convertDate(date: any) {
    return (date = new Date(date).toLocaleDateString());
  }

  changeOrganizer(event: any) {
    console.log(event.srcElement.value);
    console.log(
      this.nameEmailEmployee[
        this.emailsEmployee.indexOf(event.srcElement.value)
      ]
    );
  }
  change(email: any) {
    this.nameEmailEmployee[this.emailsEmployee.indexOf(email)];
  }

  filterEvents(date: any) {
    return this.eventApi.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  filterEventsByLink(date: any, link: any) {
    return this.eventApi.filter(
      (data: any) =>
        this.convertDate(data.date) == this.convertDate(date) &&
        data.url_online == link &&
        data.id != this.initialEvent.id
    );
  }
  isOverlappingTime(date: any, begin: any, end: any, link: any) {
    let bool = false;

    let reservation = this.filterEventsByLink(date, link);
    // let reservation = this.eventApi.filter(
    //   (data: any) =>
    //     format(new Date(data.date), 'P') == format(new Date(date), 'P') &&
    //     data.id != this.initialEvent.id
    // );
    console.log(reservation);

    try {
      if (reservation.length != 0) {
        reservation.forEach((element: any) => {
          if (
            areIntervalsOverlapping(
              {
                start: set(new Date(element.date), {
                  hours: element.time_start.slice(0, 2),
                  minutes: element.time_start.slice(3, 5),
                }),
                end: set(new Date(element.date), {
                  hours: element.time_end.slice(0, 2),
                  minutes: element.time_end.slice(3, 5),
                }),
              },
              {
                start: set(new Date(date), {
                  hours: begin.slice(0, 2),
                  minutes: begin.slice(3, 5),
                }),
                end: set(new Date(date), {
                  hours: end.slice(0, 2),
                  minutes: end.slice(3, 5),
                }),
              }
            )
          ) {
            bool = true;
            this.alertService.onCallAlert(
              'Time & Link Booked! Choose Another!',
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
  inBetweenTimeChecker(startHour: any, endHour: any, date: any, link: any) {
    let result;
    if (
      startHour == this.initialEvent.time_strat &&
      endHour == this.initialEvent.time_end
    ) {
      return false;
    }
    for (const events of this.filterEventsByLink(date, link)) {
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
    // for (const events of this.filterEvents(date)) {
    //   if (
    //     startHour == this.initialEvent.time_strat &&
    //     endHour != this.initialEvent.time_end
    //   ) {
    //     if (
    //       events.time_start.slice(0, -3) <= endHour &&
    //       events.time_end.slice(0, -3) >= endHour
    //     ) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   }
    //   if (
    //     startHour != this.initialEvent.time_strat &&
    //     endHour == this.initialEvent.time_end
    //   ) {
    //     if (
    //       events.time_start.slice(0, -3) <= startHour &&
    //       events.time_end.slice(0, -3) >= startHour
    //     ) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   }
    // }

    return result;
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

  initialForm() {
    this.form = this.formBuilder.group({
      userId: [this.initialEvent.userId, Validators.required],
      date: [
        format(new Date(this.initialEvent.date), 'yyyy-MM-dd'),
        Validators.required,
      ],
      time_start: [this.initialEvent.time_start, Validators.required],
      time_end: [this.initialEvent.time_end, Validators.required],
      title: [this.initialEvent.title, Validators.required],
      organizer: [this.initialEvent.organizer, Validators.required],
      description: [''],
      online_offline: [this.initialEvent.online_offline, Validators.required],
      url_online: [this.initialEvent.url_online],
      roomId: [this.initialEvent.roomId],
      participants: [
        this.joinParticipantById(this.initialEvent.id),
        Validators.required,
      ],
      message: [this.initialEvent.message, Validators.required],
    });
    this.radioInput = this.initialEvent.online_offline;
    this.apiService
      .getAttachmentById(this.initialEvent.id)
      .subscribe((data) => {
        console.log(data);
        this.attachApi = data;
        data?.forEach((element: any) => {
          this.uploader.addToQueue([
            new File([URL + element.path], element.realName),
          ]);
        });
      });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onCompleteItem = (item: any, status: any) => {
      console.log('Uploaded File Details:', item);
      this.alertService.onCallAlert('Upload Success!', AlertType.Success);
    };
  }
  sendEmail() {
    console.log(this.uploader.queue);
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      return;
    }
    let email = {
      title: this.f['title'].value,
      date: this.f['date'].value,
      year: new Date(this.f['date'].value).getFullYear(),
      month: new Date(this.f['date'].value).getMonth(),
      day: new Date(this.f['date'].value).getDate(),
      hour_start: Number(this.f['time_start'].value.slice(0, 2)),
      minute_start: Number(this.f['time_start'].value.slice(3, 5)),
      hour_end: Number(this.f['time_end'].value.slice(0, 2)),
      minute_end: Number(this.f['time_end'].value.slice(3, 5)),
      // datetime_start: set(new Date(this.f['date'].value), {hours: this.f['time_start'].value.slice(0,2), minutes: this.f['time_start'].value.slice(3,5)}),
      // datetime_end: set(new Date(this.f['date'].value), {hours: this.f['time_end'].value.slice(0,2), minutes: this.f['time_end'].value.slice(3,5)}),
      organizer:
        this.nameEmailEmployee[
          this.emailsEmployee.indexOf(this.f['organizer'].value)
        ],
      participants: this.f['participants'].value,
      message: this.f['message'].value,
      online_offline: this.f['online_offline'].value,
      url_online: this.f['url_online'].value,
      roomId: this.f['roomId'].value,
    };

    if (this.uploader.queue.length > 0) {
      this.uploader.queue.forEach((element) => {
        if (
          this.attachApi.filter(
            (data: any) => data.realName == element.file.name
          ).length != 0
        ) {
          this.uploader.removeFromQueue(element);
        }
      });
      this.uploader.options.additionalParameter = {
        dataId: this.initialEvent.id,
        date: this.f['date'].value,
        organizer: this.f['organizer'].value,
        participants: this.f['participants'].value,
        message: this.f['message'].value,
      };
      console.log(this.uploader.options.additionalParameter);

      this.uploader.uploadAll();
      console.log('Up + Email');
    } else {
      console.log('Sent Email');

      this.apiService.sendEmail(email).subscribe(
        (em) => {
          console.log('Email sent Success');
          this.alertService.onCallAlert(
            'Email Success Sended!',
            AlertType.Success
          );
        },
        (err) => {
          this.alertService.onCallAlert(
            'Send Email Failed!',
            AlertType.Success
          );
          console.log('Email Failed');
        }
      );
    }
  }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      this.spinner.hide()
      return;
    }
    // if (
    //   this.isOverlappingTime(
    //     this.f['date'].value,
    //     this.f['time_start'].value,
    //     this.f['time_end'].value,
    //     0
    //   )
    // ) {
    //   return;
    // }

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
      this.isOverlappingTimeReserv(
        bodyReserv.begin,
        bodyReserv.end,
        bodyReserv.resourceId
      )
    ) {
      this.spinner.hide()
      return;
    } else if (body.online_offline == 'Online') {
      if (
        this.isOverlappingTime(
          this.f['date'].value,
          this.f['time_start'].value,
          this.f['time_end'].value,
          body.url_online
        )
      ) {
        this.spinner.hide()
        return;
      }
      // if (
      //   !this.inBetweenTimeChecker(
      //     this.f['time_start'].value,
      //     this.f['time_end'].value,
      //     this.f['date'].value,
      //     body.url_online
      //   )
      // ) {
      //   this.alertService.onCallAlert(
      //     'Time & Link Booked, Choose Another!',
      //     AlertType.Error
      //   );

      //   return;
      // }
    }
    if (body.online_offline == 'Online') {
      body.roomId = 1;
    }

    // console.log(email.message);

    // this.arrayParicipants = this.f['participants'].value
    //   .replace(/\s/g, '')
    //   .split(',');
    // console.log(body);

    this.apiService.updateEvents(this.initialEvent.id, body).subscribe(
      (data) => {
        // this.alertServie.onCallAlert('Success Add Data', AlertType.Success)
        // this.router.navigate(['/dashboard/users']);
        // this.arrayParicipants.forEach((element) => {
        if (this.uploader.queue.length > 0) {
          console.log(this.uploader.queue[0]);
          console.log(this.uploader.queue[1]);
          console.log(this.uploader.queue.length);

          this.uploader.queue.forEach((element, index) => {
            // console.log(this.uploader.queue[index]);
            console.log({
              queue: element,
              attach: this.attachApi.filter(
                (data: any) => data.realName == element.file.name
              ),
            });
            if (
              this.attachApi.filter(
                (data: any) => data.realName == element.file.name
              ).length != 0
            ) {
              this.uploader.removeFromQueue(element);
            }
          });
          console.log(this.uploader.queue);

          this.uploader.options.additionalParameter = {
            dataId: this.initialEvent.id,
          };

          this.uploader.uploadAll();
          console.log('Up + Email');
        }
        if (
          this.f['participants'].value !=
          this.joinParticipantById(this.initialEvent.id)
        ) {
          this.apiService.deleteParticipantsByEvent(this.initialEvent.id);
          this.apiService
            .postParticipants({
              eventId: this.initialEvent.id,
              email: email.participants,
            })
            .subscribe(
              (subs) => {
                this.closeModal();
                this.alertService.onCallAlert(
                  'Update Success!',
                  AlertType.Success
                );
                this.ngOnInit();
              },
              (err) => {
                console.log(err);
              }
            );
        } else {
          this.closeModal();

          console.log(this.router.getCurrentNavigation());

          this.alertService.onCallAlert('Update Success!', AlertType.Success);
          // this.dayComp.ngOnInit();
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
        // });
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
      },
      () => {
        // this.dayComp.ngOnInit();
        // this.router.navigate(['/day/' + body.date]);
      }
    );
  }

  isOverlappingTimeReserv(begin: any, end: any, resourceId: any) {
    let bool = false;
    let reservation = this.reservsApi.filter(
      (data: any) =>
        format(new Date(data.begin), 'P') == format(new Date(begin), 'P') &&
        data.resourceId == resourceId &&
        data.title != this.initialEvent.title
    );
    // console.log(this.initialEvent);
    // console.log(reservation);
    
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

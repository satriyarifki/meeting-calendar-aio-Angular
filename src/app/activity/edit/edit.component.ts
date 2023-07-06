import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { areIntervalsOverlapping, format, set } from 'date-fns';
import { forkJoin } from 'rxjs';
import { AlertType } from 'src/app/services/alert/alert.model';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { EditActivityService } from 'src/app/services/edit-activity/edit-activity.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent {
  radioInput: any;
  show: Boolean = false;
  submitted: Boolean = false;
  initialEvent!: any;
  arrayParicipants: Array<String> = [];

  // API
  roomsApi: any;
  participantsApi: any;
  eventApi: any;
  emailsEmployee: any;

  //FORM
  form!: FormGroup;

  constructor(
    private editService: EditActivityService,
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    forkJoin([
      apiService.getEvents(),
      apiService.getParticipants(),
      apiService.getRooms(),
      apiService.getEmailEmployees(),
    ]).subscribe(([events, participants, rooms, emails]) => {
      this.eventApi = events;
      this.roomsApi = rooms;
      this.participantsApi = participants;
      this.emailsEmployee = emails;
      // console.log(this.eventApi);
      // console.log(this.roomsApi);
      // console.log(this.participantsApi);
    });
    if (this.editService.subsVar == undefined) {
      this.editService.subsVar = this.editService.invokeAlert.subscribe(
        (event: any) => {
          this.callModal(event);
        }
      );
    }
  }
  get f() {
    return this.form.controls;
  }
  callModal(event: any) {
    this.initialEvent = event.id;
    console.log(this.initialEvent);
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
    return this.eventApi.filter(
      (data: any) => this.convertDate(data.date) == this.convertDate(date)
    );
  }
  isOverlappingTime(date: any, begin: any, end: any, roomId: any) {
    let bool = false;
    console.log({
      status:
        format(new Date(this.eventApi[1].date), 'P') ==
        format(new Date(date), 'P'),
      dateE: format(new Date(this.eventApi[1].date), 'P'),
      date: format(new Date(date), 'P'),
    });

    let reservation = this.eventApi.filter(
      (data: any) =>
        format(new Date(data.date), 'P') == format(new Date(date), 'P') &&
        data.id != this.initialEvent.id
    );
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
              'Date & Resource Booked! Choose Another!',
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
  inBetweenTimeChecker(startHour: any, endHour: any, date: any) {
    let result;
    if (
      startHour == this.initialEvent.time_strat &&
      endHour == this.initialEvent.time_end
    ) {
      return false;
    }

    for (const events of this.filterEvents(date)) {
      if (
        startHour == this.initialEvent.time_strat &&
        endHour != this.initialEvent.time_end
      ) {
        if (
          events.time_start.slice(0, -3) <= endHour &&
          events.time_end.slice(0, -3) >= endHour
        ) {
          return true;
        } else {
          return false;
        }
      }
      if (
        startHour != this.initialEvent.time_strat &&
        endHour == this.initialEvent.time_end
      ) {
        if (
          events.time_start.slice(0, -3) <= startHour &&
          events.time_end.slice(0, -3) >= startHour
        ) {
          return true;
        } else {
          return false;
        }
      }
    }

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

  ngOnInit(): void {}
  initialForm() {
    // console.log(format(new Date (this.initialEvent.date), 'yyyy-MM-dd'));

    // console.log(this.joinParticipantById(this.initialEvent.id));

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
  }
  sendEmail() {
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      return;
    }
    let email = {
      date: this.f['date'].value,
      organizer: this.f['organizer'].value,
      participants: this.f['participants'].value,
      message: this.f['message'].value,
    };
    this.apiService.sendEmail(email).subscribe(
      (em) => {
        console.log('Email sent Success');
        this.alertService.onCallAlert(
          'Email Success Sended!',
          AlertType.Success
        );
      },
      (err) => {
        this.alertService.onCallAlert('Send Email Failed!', AlertType.Success);
        console.log('Email Failed');
      }
    );
  }
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      return;
    }
    // if (
    //   this.inBetweenTimeChecker(
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
    if (
      this.isOverlappingTime(
        this.f['date'].value,
        this.f['time_start'].value,
        this.f['time_end'].value,
        0
      )
    ) {
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

    this.apiService.updateEvents(this.initialEvent.id, body).subscribe(
      (data) => {
        console.log(this.initialEvent.id);

        // this.alertServie.onCallAlert('Success Add Data', AlertType.Success)
        // this.router.navigate(['/dashboard/users']);
        // this.arrayParicipants.forEach((element) => {
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
                },
                (err) => {
                  console.log(err);
                }
              );
          } else {
            this.closeModal();

            console.log(this.router.getCurrentNavigation());

            // this.router.navigate(['/']);
            // this.router.navigate([this.router.url]);
            this.alertService.onCallAlert('Update Success!', AlertType.Success);
            // window.location.reload();
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
      }
    );
  }
}

import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
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
  roomsApi: any;
  participantsApi: any;
  form!: FormGroup;
  eventApi: any;
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
    ]).subscribe(([events, participants, rooms]) => {
      this.eventApi = events;
      this.roomsApi = rooms;
      this.participantsApi = participants;
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
    // console.log(this.initialEvent);
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
  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.f);

      this.alertService.onCallAlert('Fill Blank Inputs!', AlertType.Warning);
      return;
    }
    if (
      this.inBetweenTimeChecker(
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

    this.apiService.updateEvents(this.initialEvent.id, body).subscribe(
      (data) => {
        console.log(this.initialEvent.id);

        // this.alertServie.onCallAlert('Success Add Data', AlertType.Success)
        // this.router.navigate(['/dashboard/users']);
        this.arrayParicipants.forEach((element) => {
          if (
            this.f['participants'].value !=
            this.joinParticipantById(this.initialEvent.id)
          ) {
            this.apiService.deleteParticipantsByEvent(this.initialEvent.id);
            this.apiService
              .postParticipants({
                eventId: this.initialEvent.id,
                email: element,
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

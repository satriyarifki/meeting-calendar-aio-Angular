import { Component } from '@angular/core';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent {
  show:Boolean = false

  constructor(private voteService:VoteActivityService){

  }
  ngOnInit(): void {

    if (this.voteService.subsVar == undefined) {
      this.voteService.subsVar = this.voteService.invokeAlert.subscribe(
        (data) => {
          this.callModal(data);
        }
      );
    }
  }

  callModal(data: any) {
    this.initialForm();
    // console.log(this.authService.getUser()[0].lg_nik);

    this.show = true;
  }
  closeModal() {
    this.show = false;
  }

  initialForm(){

  }
}

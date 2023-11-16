import { Component } from '@angular/core';
import { VoteActivityService } from 'src/app/services/vote-activity/vote-activity.service';

@Component({
  selector: 'app-create-vote',
  templateUrl: './create-vote.component.html',
  styleUrls: ['./create-vote.component.css']
})
export class CreateVoteComponent {
  show:Boolean = false

  constructor(private voteService:VoteActivityService){

  }
  ngOnInit(): void {

    if (this.voteService.subsVar == undefined) {
      this.voteService.subsVar = this.voteService.invokeCreate.subscribe(
        (data: any) => {
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

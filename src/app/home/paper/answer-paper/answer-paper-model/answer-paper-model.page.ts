import { Component, OnInit, Input } from '@angular/core';
import { Question } from 'src/app/home/question/question.service';
import { Attempt, AttemptService } from 'src/app/home/user/attempt.service';
import { firestore } from 'firebase';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as firebase from 'firebase/app/';

@Component({
  selector: 'app-answer-paper-model',
  templateUrl: './answer-paper-model.page.html',
  styleUrls: ['./answer-paper-model.page.scss'],
})
export class AnswerPaperModelPage implements OnInit {

  faTimes = faTimes;
  
  @Input('paper') paper: string;
  @Input('user') user: string;
  @Input('questionArray') questionArray: {id: string, data: Question}[];
  @Input('answerArray') answerArray: string[];
  @Input('marks') marks: string;

  constructor(
    private attemptService: AttemptService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    console.log(this.user, this.paper)
    console.log(this.questionArray);
    console.log(this.answerArray);
  }

  private async close(){
    await this.modalController.dismiss();
  }

  private async checkForPreviousAttempts(): Promise<{status: boolean, attempt: {id: string, data: Attempt}}>{
    let status: boolean = false;
    let attempt: { id: string, data: Attempt} = {
      "id": "",
      "data": this.createNullAttempt()
    }
    let checkAttempts: { id: string, data: Attempt }[];
    console.log(this.user, this.paper);
    await this.attemptService.getAttemptsByUserId_PaperId(this.user, this.paper).then(res =>{
      checkAttempts = res;
    });
    if(checkAttempts.length != 0){
      status = true;
      attempt = checkAttempts[0];
    }
    return {status, attempt};
  }

  private async saveAttempts(){
    let marks: number = Number(this.marks);
    let previousAttempt: {status: boolean, attempt: {id: string, data: Attempt}};
    await this.checkForPreviousAttempts().then(res=>{
      previousAttempt = res;
    });
    if(previousAttempt.status){
      if(previousAttempt.attempt.data.highest<marks){
        previousAttempt.attempt.data.highest = marks;
      }
      if(previousAttempt.attempt.data.lowest>marks){
        previousAttempt.attempt.data.lowest = marks;
      }
      previousAttempt.attempt.data.average = ((previousAttempt.attempt.data.average * previousAttempt.attempt.data.no_of_attempts) + marks) / (previousAttempt.attempt.data.no_of_attempts + 1);
      previousAttempt.attempt.data.no_of_attempts++;

      previousAttempt.attempt.data.timestamp = firebase.firestore.Timestamp.now();

      this.attemptService.updateAttempt(previousAttempt.attempt.data, previousAttempt.attempt.id)
    }
    else{
      let attempt: Attempt = {
        "paper": this.paper,
        "user": this.user,
        "no_of_attempts": 1,
        "highest": marks,
        "lowest": marks,
        "average": marks,
        "timestamp": firebase.firestore.Timestamp.now()
      }
      this.attemptService.addAttempt(attempt);
    }   
  }

  private createNullAttempt() {
    return {
      "paper": "",
      "user": "",
      "no_of_attempts": 0,
      "highest": 0,
      "lowest": 0,
      "average": 0,
      "timestamp": firebase.firestore.Timestamp.now()
    }
  }

}

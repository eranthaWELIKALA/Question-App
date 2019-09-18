import { Component, OnInit, Input } from '@angular/core';
import { Question, QuestionService } from 'src/app/question.service';
import { ModalController } from '@ionic/angular';
import { faTimes } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.page.html',
  styleUrls: ['./delete-modal.page.scss'],
})
export class DeleteModalPage implements OnInit {

  faTimes = faTimes;

  @Input() trashQuestionArray: {id: string, data: Question}[] = [];
  private confirmedTrashQuestionArray: string[];

  constructor(private modalController: ModalController, private questionService: QuestionService) { }

  ngOnInit() {
  }

  private deleteQuestions(){
    if(this.confirmedTrashQuestionArray != undefined){
      this.confirmedTrashQuestionArray.forEach(element => {
        this.questionService.removeQuestion(element);
      });
    }
    this.filterConfirmedQuestions();
    this.dismissDeleteModal();
  }

  private dismissDeleteModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true,
      'trashQuestionArray': this.trashQuestionArray
    });
  }

  private filterConfirmedQuestions(){
    if(this.confirmedTrashQuestionArray != undefined){
      this.confirmedTrashQuestionArray.forEach(element => {
        this.trashQuestionArray = this.trashQuestionArray.filter(x => x.id != element);
      }); 
    }   
  }

}

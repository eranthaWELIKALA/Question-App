import { Component, OnInit, Input } from '@angular/core';
import { Question, QuestionService } from '../../question.service';
import { ModalController, AlertController } from '@ionic/angular';
import { faTimes, faTrashRestore } from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.page.html',
  styleUrls: ['./delete-modal.page.scss'],
})
export class DeleteModalPage implements OnInit {

  faTimes = faTimes;
  faTrashRestore =faTrashRestore;

  @Input() trashQuestionArray: {id: string, data: Question}[] = [];
  private deletedQuestionArray: {id: string, data: Question}[] = [];
  public confirmedTrashQuestionArray: any[];

  constructor(
    private modalController: ModalController, 
    private alertController: AlertController,
    private questionService: QuestionService) { }

  ngOnInit() {
  }

  public deleteQuestions(){
    if(this.confirmedTrashQuestionArray != undefined){
      this.confirmedTrashQuestionArray.forEach(async element => { 
        if(element.id!=""){
          await this.questionService.removeQuestion(element.id);
        }   
      });
    }
    this.filterConfirmedQuestions();
    this.dismissDeleteModal();
  }

  public dismissDeleteModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true,
      'trashQuestionArray': this.trashQuestionArray, 
      'restore': false
    });
  }

  private filterConfirmedQuestions(){
    if(this.confirmedTrashQuestionArray != undefined){
      this.confirmedTrashQuestionArray.forEach(element => {
        this.deletedQuestionArray = this.trashQuestionArray.filter(x => x == element);
        this.trashQuestionArray = this.trashQuestionArray.filter(x => x != element);
      }); 
      this.deletedQuestionArray.forEach(element =>{
        // Remove the added image
        if(element.data.image_url != "" && element.data.metadata != ""){
          this.questionService.removeImage(JSON.parse(element.data.metadata));
        }
      })
    }   
  }

  public async confirmRestore(){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Do you want restore the remaining questions in trash?',
      message: "Questions will be append to the last question",
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.modalController.dismiss({
              'dismissed': true,
              'trashQuestionArray': this.trashQuestionArray,
              'restore': true
            });
          }
        }
      ]
    });
    alert.present();
  }

}

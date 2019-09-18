import { Component, OnInit } from '@angular/core';
import { Question, QuestionService } from 'src/app/question.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { DeleteModalPage } from '../delete-question/delete-modal/delete-modal.page';
import { UserService, Subject } from 'src/app/user.service';

@Component({
  selector: 'app-delete-question',
  templateUrl: './delete-question.page.html',
  styleUrls: ['./delete-question.page.scss'],
})
export class DeleteQuestionPage implements OnInit {

  private questionArray: {id: string, data: Question}[];
  private allQuestionArray: {id: string, data: Question}[];

  private trashQuestionArray: {id: string, data: Question}[] = [];
  private no_trash_questions: number;

  private subjects: {id: string, data: Subject}[];
  private no_subjects: number;

  private subjectFilter: string[];

  constructor(
    private questionService: QuestionService, 
    private userService: UserService, 
    private loadingController: LoadingController, 
    private modalController: ModalController) { }

  ngOnInit() {
    this.questionService.getQuestions().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.questionArray = res;
      this.allQuestionArray = res;
      console.log(JSON.stringify(res));
      loading.dismiss();
    },
    error => {
      console.log(error);
    });

    this.userService.getSubjects().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.subjects = res;
      console.log(res);
      this.no_subjects = this.subjects.length;
      loading.dismiss();
    },
    error => {
      console.log(error);
    });
  }

  private async showDeleteModal() {
    console.log("___showDeleteModal()___");
    const modal = await this.modalController.create({
      component: DeleteModalPage,
      componentProps: {
        'trashQuestionArray': this.trashQuestionArray
      }
    });
    modal.onDidDismiss().then(data => {
      console.log(data);
      this.trashQuestionArray = [];
      this.trashQuestionArray = data.data["trashQuestionArray"];
      this.no_trash_questions = (data.data["trashQuestionArray"]).length;
      console.log(this.no_trash_questions);
    })
    return await modal.present();
  }

  private refresh(){
    console.log("___refresh()___");
    this.questionService.getQuestions().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.questionArray = res;
      console.log(res);
      loading.dismiss();
    },
    error => {
      console.log(error);
    });
  }

  private removeQuestion(index: number){    
    console.log("___removeQuestion()___");
    let question = this.questionArray[index];
    this.questionArray.splice(index,1);
    this.trashQuestionArray.push(question);
    this.no_trash_questions = this.trashQuestionArray.length;
  }

  private filterQuestions(){
    console.log("___filterQuestions()___");
    this.questionArray = [];
    this.subjectFilter.forEach(element => {
      console.log("Filted subject id: " + element);
      this.questionArray = this.questionArray.concat(this.allQuestionArray.filter(x => x.data.subject == element));
    });
  }

}

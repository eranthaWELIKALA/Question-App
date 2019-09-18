import { Component, OnInit } from '@angular/core';
import { Question, QuestionService } from 'src/app/question.service';
import { LoadingController } from '@ionic/angular';
import { Subject, UserService } from 'src/app/user.service';

@Component({
  selector: 'app-view-question',
  templateUrl: './view-question.page.html',
  styleUrls: ['./view-question.page.scss'],
})
export class ViewQuestionPage implements OnInit {

  public questionArray: {id: string, data: Question}[];
  private allQuestionArray: {id: string, data: Question}[];

  private subjects: {id: string, data: Subject}[];
  private no_subjects: number;

  public keyListArray: string[];
  public no_questions: number;

  private subjectFilter: string[];

  constructor(
    private questionService:QuestionService, 
    private userService: UserService,
    private loadingController: LoadingController) {
    
   }

  ngOnInit() {
    this.questionService.getQuestions().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.questionArray = res;
      this.allQuestionArray = res;
      console.log(res);
      this.no_questions = this.questionArray.length;
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

  private updateQuestion(question){
    console.log("___updateQuestion()___");
    console.log(question);
    this.questionService.updateQuestion(question.data, question.id);
  }

  private filterQuestions(){
    console.log("___filterQuestions()___");
    this.questionArray = [];
    this.subjectFilter.forEach(element => {
      console.log("Filted subject id: " + element);
      this.questionArray = this.questionArray.concat(this.allQuestionArray.filter(x => x.data.subject == element));
    });
    this.no_questions =this.questionArray.length;
  }
  

  

}

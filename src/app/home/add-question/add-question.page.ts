import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Question_Answer } from '../home.page';
import { QuestionService } from 'src/app/question.service';
import { Question} from '../../question.service'
import { Router } from '@angular/router'
import { UserService, Subject } from 'src/app/user.service';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.page.html',
  styleUrls: ['./add-question.page.css'],
})
export class AddQuestionPage implements OnInit {
  
  public questionGroup: Array<Question> = [];

  private subjects: {id: string, data: Subject}[];

  private disableSaveBtn: boolean = false;

  constructor(
    private alertController: AlertController, 
    private questionService: QuestionService, 
    private loadingController: LoadingController, 
    private userService: UserService, 
    private router: Router) {
    this.createDummyQuestion();
   }

  ngOnInit() {
    this.userService.getSubjects().subscribe(async res => {
      const loading = await this.loadingController.create({
        message: 'Loading'
      });
      await loading.present();
      this.subjects = res;
      console.log(res);
      loading.dismiss();
    },
    error => {
      console.log(error);
    });
  }

  private goBack(){
    this.router.navigateByUrl("/home");
  }

  private addQuestion(){
    this.createDummyQuestion();
    this.alertGen("Question is added!!!");
    console.log("Question is added!!!");
  }

  private removeQuestion(index: number){
    this.questionGroup.splice(index,1);
  }

  private async formSubmit(){
    this.disableSaveBtn = true;
    this.questionGroup.forEach(element => {
      let que: Question = {
        "instructor": "",
        "subject": element.subject,
        "question": element.question,
        "a": element.a,
        "b": element.b,
        "c": element.c,
        "d": element.d,
        "e": element.e,
        "answer": element.answer,
        "papers": ""
      }
      console.log(JSON.stringify(que));
      this.questionService.addQuestion(que).then(
        onfulfilled => {
          console.log(onfulfilled.id);
          this.questionGroup.splice(this.questionGroup.indexOf(element), 1);
        },
        onrejected => {
          console.log(onrejected);
        }
      );

    });
    this.disableSaveBtn = false;
    //this.questionGroup = [];
  }

  private formValidation(question: Question): boolean{
    /*if(question.instructor == undefined || question.instructor == '' || question.instructor == null){
      return false;
    }*/
    if(question.subject == undefined || question.subject == '' || question.subject == null){
      return false;
    }
    if(question.question == undefined || question.question == '' || question.question == null){
      return false;
    }
    if(question.answer == undefined || question.answer == '' || question.answer == null){
      return false;
    }
    return true;
  }

  private createDummyQuestion(){
    let question: Question= {
      "subject": undefined,
      "instructor": "",
      "question": "Question",
      "a": undefined,
      "b": undefined,
      "c": undefined,
      "d": undefined,
      "e": undefined,
      "answer": undefined,
      "papers": ""
    }
    this.questionGroup.push(question);
  }

  private async alertGen(message: any){
    const alert = await this.alertController.create({
      header: 'Alert',
      message: message,
      buttons: ['CLOSE']
    });

    await alert.present();
  }

  private changeTab(option: any){
    switch (option){
      case ("add"):{
        this.alertGen("Add Questions");
        break;
      }        
      case "view": {
        this.alertGen("View Questions");
        break;
      }        
      case "delete": {
        this.alertGen("Delete Questions");
        break;
      }
    }
        
          
  }

}

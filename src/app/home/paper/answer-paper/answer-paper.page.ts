import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Paper } from '../paper.service';
import { QuestionService, Question } from '../../question/question.service';
import { IonSlides, AlertController, ModalController, NavController } from '@ionic/angular';
import { User } from 'src/app/initial/user.service';
import { SharedService } from 'src/app/shared/shared.service';
import { faBars} from '@fortawesome/free-solid-svg-icons';
import { AnswerPaperModelPage } from './answer-paper-model/answer-paper-model.page';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-answer-paper',
  templateUrl: './answer-paper.page.html',
  styleUrls: ['./answer-paper.page.css'],
})
export class AnswerPaperPage implements OnInit, OnDestroy {

  faBars = faBars;

  @ViewChild("questionSlider",{ read: false, static: false }) slides: IonSlides;
  private backSlideButton: boolean = true;
  private nextSlideButton: boolean = true;
  private submitButton: boolean = false;
  private jumpQuestion: number;

  private maxTime: number;

  private answerPaper: boolean = false;

  private loggedInUser: {id: string, data: User};

  private paper: {id: string, data: Paper};

  private questionArray: {id: string, data: Question}[];
  private allQuestionArray: {id: string, data: Question}[];
  private answerArray: string[];

  private routerSubscription: Subscription;
  private questionSubscription: Subscription;

  private timeoutVar;

  constructor(
    private questionService: QuestionService,
    private sharedService: SharedService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastMessageService: ToastMessageService,
    private route: ActivatedRoute,
    private navController: NavController) {      
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
    
    this.routerSubscription = this.route.queryParams.subscribe(params => {
      if (params && params.paper) {
        this.paper = JSON.parse(params.paper);
        console.log(this.paper);
      }
    });
  }

  ngOnInit() {
    this.readyToAnswer();

    this.questionSubscription = this.questionService.getQuestions().subscribe(async res => {
      await this.loadingService.showLoading('Loading');
      res = res.filter(x => x.data.paper == this.paper.id);
      this.questionArray = res;
      this.allQuestionArray = res;
      this.answerArray = [];
      this.answerArray.length = this.questionArray.length;
      //console.log(JSON.stringify(res));
      console.log(this.answerArray.length);
      this.loadingService.hideLoading();
    },
    error => {
      console.log(error);
    });
  }

  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
    this.questionSubscription.unsubscribe();
  }

  private async readyToAnswer(){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Are you ready to answer ' + this.paper.data.name + ' ' + this.paper.data.year + '?',
      message: 'No. of Questions: ' + this.paper.data.no_of_questions + ', <br>Allocated time(mins): ' + this.paper.data.time,
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
            this.navController.navigateRoot("/home/paper");
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Continue');
            this.answerPaper = true;
            this.maxTime = Number(this.paper.data.time) * 60;
            this.startTimer();
            this.sharedService.setOnPaper(true);
          }
        }
      ]
    });
    alert.present();
  }

  private startTimer(){
    clearInterval(this.timeoutVar);
    this.timeoutVar = setTimeout(async x => 
      {
        if(this.maxTime <= 0) {          
          this.toastMessageService.showToastMessage("Time out", 2000);
          this.toastMessageService.showToastMessage("You have got " + this.checkAnswers(), 5000);
        }
        else if(this.maxTime>0){
          this.maxTime -= 1;
          this.startTimer();
        } 
      }, 1000);
  }

  private showTime(seconds: number): string{
    let zerothBreaker = "";
    let firstBreaker = ": ";
    let secondBreaker = ": ";
    let val = 60;
    let no_of_hours: number = (((seconds / val) >> 0) / val) >> 0;
    let no_of_minutes: number = ((seconds / val) >> 0) - (no_of_hours * val);
    let no_of_seconds: number =  seconds - ((no_of_hours * val * val) + (no_of_minutes * val));
    if(no_of_hours<10) zerothBreaker = '0';
    if(no_of_minutes<10) firstBreaker = ': 0';
    if(no_of_seconds<10) secondBreaker = ': 0';
    return zerothBreaker + no_of_hours + firstBreaker + no_of_minutes + secondBreaker + no_of_seconds;
  }

  private slide(option){
    option == "back"? this.slides.slidePrev(): this.slides.slideNext();    
  }

  private checkSlideOptions(){
    console.log('___checkSlideOptions()___');
    let promise1 = this.slides.isBeginning();
    let promise2 = this.slides.isEnd();

    Promise.all([promise1, promise2]).then((data) => {
      data[0] ? this.backSlideButton = false : this.backSlideButton = true;
      data[1] ? [this.nextSlideButton = false, this.submitButton = true] : [this.nextSlideButton = true, this.submitButton = false];
    });
  }

  private async submit(){
    console.log("___submit()___");
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Are you sure you finished ' + this.paper.data.name + ' ' + this.paper.data.year + '?',
      message: 'You have : ' + (this.questionArray.length-this.answerArray.filter(x=>x != undefined).length).toString() + " questions left",
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
            console.log('Examine');
            this.sharedService.setOnPaper(false);
            this.handleAnswerModal();
            this.toastMessageService.showToastMessage("You have got " + this.checkAnswers(), 5000);
          }
        }
      ]
    });
    alert.present();
    
  }

  private jumpToQuestion(questionNumber: number){
    this.checkSlideOptions();
    Promise.all([this.slides.length()]).then((data) =>{
      questionNumber>0 && data[0]>=questionNumber? this.slides.slideTo(questionNumber-1): this.toastMessageService.showToastMessage("Invalid Question No.");
    }); 
  }

  private checkAnswers(): string{

    let correctAnswers: number = 0;
    console.log(this.questionArray)
    this.questionArray.forEach(x => x.data.answer == this.answerArray[this.questionArray.indexOf(x)]? correctAnswers++: '');
    return ((correctAnswers/this.questionArray.length)*100).toFixed(2);
  }

  private async handleAnswerModal(){
    console.log(this.loggedInUser.id, this.paper.id)
    const modal = await this.modalController.create({
      component: AnswerPaperModelPage,
      cssClass: "my-answerPaper-modal-css",
      componentProps: {
        "paper" : this.paper.id,
        "user" : this.loggedInUser.id,
        "questionArray" : this.questionArray, 
        "answerArray" : this.answerArray,
        "marks" : this.checkAnswers()
      },
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
      this.navController.navigateRoot("home/user")
    })
    return await modal.present();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { QuestionService, Question } from '../question.service';
import { UserService, Subject, User } from '../../../initial/user.service';
import { ActivatedRoute } from '@angular/router';
import { PaperService, Paper } from '../../paper/paper.service';
import { DeleteModalPage } from '../delete-question/delete-modal/delete-modal.page';
import { SharedService } from 'src/app/shared/shared.service';
import { faKeyboard, faBars, faUndo, faTrash, faCaretSquareDown, faCaretSquareUp } from '@fortawesome/free-solid-svg-icons';
import { KeyboardPage } from 'src/app/util/keyboard/keyboard.page';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';
import { NewsfeedService, Newsfeed } from '../../newsfeed/newsfeed.service';
import { firestore } from 'firebase/app';
import { CreateNewsfeedPage } from '../../newsfeed/create-newsfeed/create-newsfeed.page';
import { AdMobFree } from '@ionic-native/admob-free/ngx';

@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.page.html',
  styleUrls: ['./add-question.page.scss'],
})
export class AddQuestionPage implements OnInit, OnDestroy {

  // Icons
  faKeyboard = faKeyboard;
  faBars = faBars;  
  faUndo = faUndo;   
  faTrash = faTrash;
  faCaretSquareDown = faCaretSquareDown;
  faCaretSquareUp = faCaretSquareUp;

  public paperDetailsShow: boolean = true;
  public filtersShow: boolean = true;
  public imagesGroupShow: boolean = false;
  
  //private image;
  public questionGroup: {id: string, data: Question}[] = [];

  public papers: {id: string, data: Paper}[];
  public paper: {id: string, data: Paper};
  public paperId: string;
  private tempPaperId: string;

  public subjects: {id: string, data: Subject}[];  
  //private subject: {id: string, data: Subject};
  public subjectId: string;

  private loggedInUser: {id: string, data: User};

  private trashQuestionArray: {id: string, data: Question}[] = [];
  public no_trash_questions: number;

  public disableSaveBtn: boolean = false;

  private routerSubscription: Subscription;
  private userSubscription: Subscription;
  private fileUploadSubscription: Subscription;
  private questionSubscription: Subscription;
  private subjectSubscription: Subscription;

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private questionService: QuestionService, 
    private userService: UserService, 
    public sharedService: SharedService,
    private paperService: PaperService,
    private newsfeedService: NewsfeedService,
    private loadingService: LoadingService,
    private toastMessageService: ToastMessageService,
    private adMob: AdMobFree){
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
      this.adMob.banner.config(this.sharedService.getBannerConfig());
   }

  async ngOnInit() {  
    await this.loadingService.showLoading('Loading');

    this.userSubscription = this.userService.getSubjects().subscribe(async res => {
      let result: any = []
      if(this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined){
        this.loggedInUser.data.units.forEach(element =>{
          result = result.concat(res.filter(x => x.id == element))
        })
      }
      this.subjects = result;
      console.log(result);
      this.loadingService.hideLoading();
      
      this.routerSubscription = this.route.queryParams.subscribe(async params => {
        if (params && params.subjectId && params.paperId) {
          this.subjectId = params.subjectId;
          this.tempPaperId = params.paperId;
        }
      });
    },
    error => {
      console.log(error);
      this.loadingService.hideLoading();
    });

    // Google Ads
    this.adMob.banner.prepare().then(()=>{
      this.adMob.banner.show();
    }).catch(onrejected=>{
      console.log(onrejected);
    });
  }
  
  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.fileUploadSubscription!=undefined?this.fileUploadSubscription.unsubscribe():"";
    this.questionSubscription!=undefined?this.questionSubscription.unsubscribe():"";
    this.subjectSubscription!=undefined?this.subjectSubscription.unsubscribe():"";
    this.adMob.banner.remove();
  }

  removeImage(evnt){
    console.log("___removeImage()___" + evnt)
  }

  /** This function loads the Quill Keyboad
   * loadKeyboard(currentText. isArray, variable, index, path)
   * Parameters:
   *  @currentText - currently added text in the variable you are going to edit
   *  @isArray - whether the variable is in a array or not
   *  @variable - variable reference
   *  @index - if it is in an array the index
   *  @path - ex: data.question.options
   */
  public async loadKeyboard(curentText: string, isArray: boolean, variable: any, index: number, path: string){
    console.log("___loadKeyboard()___");
    const modal = await this.modalController.create({
      component: KeyboardPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'text': curentText,
        'elementName': ""
      },
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
      console.log(data.data['text'])
      if(data.data['text'] == undefined){
        data.data['text'] = curentText;
      }      

      if(isArray){
        if(path!=undefined){
          let path_var = path.split('.');
          let length = path_var.length;
          switch(length){
            case 1:{
              variable[index][path_var[0]] = data.data['text'];
              break;
            }
            case 2:{
              variable[index][path_var[0]][path_var[1]] = data.data['text'];
              break;
            }
            case 3:{
              variable[index][path_var[0]][path_var[1]][path_var[2]] = data.data['text'];
              break;
            }
          }
        }
        else{
          variable[index] = data.data['text'];
        }        
      }
      else{
        variable = data.data['text'];
      }      
    })
    return await modal.present();
    
  }

  public async uploadFile(event: FileList, index: number, type: string = "questionImage", answerLetter: string = ''){
    await this.loadingService.showLoading('Uploading');
    this.disableSaveBtn = true;

    if(type=="questionImage"){
      // Remove previously added image
      if(this.questionGroup[index].data.image_url != "" && this.questionGroup[index].data.metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.metadata));
      }
      let {task, fileRef} = this.questionService.uploadImage(event.item(0));
      task.then().then(
        res => {
          this.questionGroup[index].data.metadata = JSON.stringify(res.metadata);
          this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
            this.questionGroup[index].data.image_url = res;
            console.log(this.questionGroup[index].data.image_url);      
            
            // Quickly save the current question
            this.quickSave(index);
            this.loadingService.hideLoading();
            this.disableSaveBtn = false;
          },
          err => {
            console.log(err);
            this.loadingService.hideLoading();
            this.disableSaveBtn = false;
          })
        });
    }
    else{
      // Remove previously added image
      if(answerLetter=='a'){
        if(this.questionGroup[index].data.imageA != "" && this.questionGroup[index].data.a_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.a_metadata));          
        }
        let {task, fileRef} = this.questionService.uploadImage(event.item(0));
          task.then().then(
            res => {
              this.questionGroup[index].data.a_metadata = JSON.stringify(res.metadata);
              this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
                this.questionGroup[index].data.imageA = res;
                console.log(this.questionGroup[index].data.imageA);      
                
                // Quickly save the current question
                this.quickSave(index);
                this.loadingService.hideLoading();
                this.disableSaveBtn = false;
              },
              err => {
                console.log(err);
                this.loadingService.hideLoading();
                this.disableSaveBtn = false;
              })
            });
      }
      else if(answerLetter=='b'){
        if(this.questionGroup[index].data.imageB != "" && this.questionGroup[index].data.b_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.b_metadata));
        }
        let {task, fileRef} = this.questionService.uploadImage(event.item(0));
        task.then().then(
          res => {
            this.questionGroup[index].data.b_metadata = JSON.stringify(res.metadata);
            this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
              this.questionGroup[index].data.imageB = res;
              console.log(this.questionGroup[index].data.imageB);      
              
              // Quickly save the current question
              this.quickSave(index);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            },
            err => {
              console.log(err);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            })
          });
      }
      else if(answerLetter=='c'){
        if(this.questionGroup[index].data.imageC != "" && this.questionGroup[index].data.c_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.c_metadata));
        }
        let {task, fileRef} = this.questionService.uploadImage(event.item(0));
        task.then().then(
          res => {
            this.questionGroup[index].data.c_metadata = JSON.stringify(res.metadata);
            this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
              this.questionGroup[index].data.imageC = res;
              console.log(this.questionGroup[index].data.imageC);      
              
              // Quickly save the current question
              this.quickSave(index);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            },
            err => {
              console.log(err);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            })
          });
      }
      else if(answerLetter=='d'){
        if(this.questionGroup[index].data.imageD != "" && this.questionGroup[index].data.d_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.d_metadata));
        }
        let {task, fileRef} = this.questionService.uploadImage(event.item(0));
        task.then().then(
          res => {
            this.questionGroup[index].data.d_metadata = JSON.stringify(res.metadata);
            this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
              this.questionGroup[index].data.imageA = res;
              console.log(this.questionGroup[index].data.imageA);      
              
              // Quickly save the current question
              this.quickSave(index);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            },
            err => {
              console.log(err);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            })
          });
      }
      else if(answerLetter=='e'){
        if(this.questionGroup[index].data.imageE != "" && this.questionGroup[index].data.e_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.e_metadata));
        }
        let {task, fileRef} = this.questionService.uploadImage(event.item(0));
        task.then().then(
          res => {
            this.questionGroup[index].data.e_metadata = JSON.stringify(res.metadata);
            this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
              this.questionGroup[index].data.imageE = res;
              console.log(this.questionGroup[index].data.imageE);      
              
              // Quickly save the current question
              this.quickSave(index);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            },
            err => {
              console.log(err);
              this.loadingService.hideLoading();
              this.disableSaveBtn = false;
            })
          });
      }
      else{
        // ntohing to do
      }
    }
    
  }

  private async quickSave(index: number){

    // Handle image_url & metadata
    if(this.questionGroup[index].data.image_url == undefined){
      this.questionGroup[index].data.image_url = "";
    }
    if(this.questionGroup[index].data.metadata == undefined){
      this.questionGroup[index].data.metadata = "";
    } 

  
    // Remove previously added image
    if(!this.questionGroup[index].data.image){
      if(this.questionGroup[index].data.image_url != "" && this.questionGroup[index].data.metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.metadata)); 
        this.questionGroup[index].data.image_url = "";
        this.questionGroup[index].data.metadata = "";     
      }
    }
    if(!this.questionGroup[index].data.image_A){
      if(this.questionGroup[index].data.imageA != "" && this.questionGroup[index].data.a_metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.a_metadata)); 
        this.questionGroup[index].data.imageA = "";
        this.questionGroup[index].data.a_metadata = "";     
      }
    }
    if(!this.questionGroup[index].data.image_B){
      if(this.questionGroup[index].data.imageB != "" && this.questionGroup[index].data.b_metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.b_metadata));
        this.questionGroup[index].data.imageB = "";
        this.questionGroup[index].data.b_metadata = "";
      }
    }
    if(!this.questionGroup[index].data.image_C){
      if(this.questionGroup[index].data.imageC != "" && this.questionGroup[index].data.c_metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.c_metadata));
        this.questionGroup[index].data.imageC = "";
        this.questionGroup[index].data.c_metadata = "";
      }
    }
    if(!this.questionGroup[index].data.image_D){
      if(this.questionGroup[index].data.imageD != "" && this.questionGroup[index].data.d_metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.d_metadata));
        this.questionGroup[index].data.imageD = "";
        this.questionGroup[index].data.d_metadata = "";
      }
    }
    if(!this.questionGroup[index].data.image_E){
      if(this.questionGroup[index].data.imageE != "" && this.questionGroup[index].data.e_metadata != ""){
        this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.e_metadata));
        this.questionGroup[index].data.imageE = "";
        this.questionGroup[index].data.e_metadata = "";
      }
    }

    // Define the question
    let que: Question = {
      "instructor": this.loggedInUser.id,
      "subject": this.paper.data.subject,
      "question": this.questionGroup[index].data.question,
      "a": this.questionGroup[index].data.a,
      "b": this.questionGroup[index].data.b,
      "c": this.questionGroup[index].data.c,
      "d": this.questionGroup[index].data.d,
      "e": this.questionGroup[index].data.e,
      "answer": this.questionGroup[index].data.answer,
      "paper": this.paper.id,
      "number": (index+1).toString(),
      "image": this.questionGroup[index].data.image,
      "image_A": this.questionGroup[index].data.image_A,
      "imageA": this.questionGroup[index].data.imageA,
      "image_B": this.questionGroup[index].data.image_B,
      "imageB": this.questionGroup[index].data.imageB,
      "image_C": this.questionGroup[index].data.image_C,
      "imageC": this.questionGroup[index].data.imageC,
      "image_D": this.questionGroup[index].data.image_D,
      "imageD": this.questionGroup[index].data.imageD,
      "image_E": this.questionGroup[index].data.image_E,
      "imageE": this.questionGroup[index].data.imageE,
      "image_url": this.questionGroup[index].data.image_url,
      "metadata": this.questionGroup[index].data.metadata,
      "a_metadata": this.questionGroup[index].data.a_metadata,
      "b_metadata": this.questionGroup[index].data.b_metadata,
      "c_metadata": this.questionGroup[index].data.c_metadata,
      "d_metadata": this.questionGroup[index].data.d_metadata,
      "e_metadata": this.questionGroup[index].data.e_metadata
    }
    console.log(JSON.stringify(que));
    if(this.questionGroup[index].id != ""){
      await this.questionService.updateQuestion(que, this.questionGroup[index].id).then(
        onfulfilled => {
          console.log(onfulfilled);
        },
        onrejected => {
          console.log(onrejected);
        }
      );
    }
    else{
      await this.questionService.addQuestion(que).then(
        onfulfilled => {
          console.log(onfulfilled.id);
          this.paper.data.added_questions++;
        },
        onrejected => {
          console.log(onrejected);
        }
      );
    }
    await this.paperService.updatePaper(this.paper.data, this.paper.id).then(
      onfulfilled => {
        console.log(onfulfilled);
      },
      onrejected => {
        console.log(onrejected);
      }
    );
  }

  public addQuestion(){   
    // Checking whether more questions can be added or not
    if(this.paper.data.no_of_questions > this.questionGroup.length){
      this.createDummyQuestion();
      this.toastMessageService.showToastMessage("Question is added!!!", 2000, "top");
      console.log("Question is added!!!");
    }
    else{
      this.toastMessageService.showToastMessage("You have already defined all the questions for this paper", 2000, "top");
    }

    this.disableSaveBtn=!this.disableSaveBtn;
  }

  public removeQuestion(index: number){
    console.log("___removeQuestion()___");
    let question = this.questionGroup[index];
    this.questionGroup.splice(index,1);
    this.trashQuestionArray.push(question);
    this.no_trash_questions = this.trashQuestionArray.length;
  }

  public async showDeleteModal() {
    console.log("___showDeleteModal()___");
    const modal = await this.modalController.create({
      component: DeleteModalPage,
      componentProps: {
        'trashQuestionArray': this.trashQuestionArray
      },
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
      console.log(data);
      this.trashQuestionArray = [];
      this.trashQuestionArray = data.data["trashQuestionArray"];
      this.no_trash_questions = (data.data["trashQuestionArray"]).length;
      console.log(this.no_trash_questions);
      if(data.data['restore']){
        this.restoreRemovedQuestions();
      }
    })
    return await modal.present();
  }

  private restoreRemovedQuestions(){
    this.disableSaveBtn = true;
    if(!((this.questionGroup.length + this.trashQuestionArray.length) > this.paper.data.no_of_questions)){      
      this.questionGroup = this.questionGroup.concat(this.trashQuestionArray);
      this.trashQuestionArray = [];
      this.no_trash_questions = this.trashQuestionArray.length;
    }
    else{
      this.toastMessageService.showToastMessage("Allowed no of questions are exceeded", 2000, "top");
    }
    this.disableSaveBtn = false;
  }

  public async reload(){
    this.disableSaveBtn = true;
    let alert = await this.alertController.create({
      header: 'Reload',
      subHeader: 'Do you realy want to reload?',
      message: 'Unsaved changes might be lost',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
            this.disableSaveBtn = false;
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Continue');

            // Load upto last saved position
            this.filterQuestionsByPaper();

            this.trashQuestionArray = [];
            this.no_trash_questions = this.trashQuestionArray.length;
            this.disableSaveBtn = false;
          }
        }
      ]
    });
    alert.present();
  }

  public async formSubmit(){
    if(this.paperId == undefined){
        this.toastMessageService.showToastMessage('Please select a Paper first', 2000);
        this.disableSaveBtn=!this.disableSaveBtn;
        return;
    }
    // Check question group array
    for (let element of this.questionGroup){
      if(element.data.question==""){
        this.toastMessageService.showToastMessage("Questions can not left as empty");
        this.disableSaveBtn=!this.disableSaveBtn;
        return;
      }
      if(element.data.answer==""){
        this.toastMessageService.showToastMessage("All the questions should have an answer");
        this.disableSaveBtn=!this.disableSaveBtn;
        return;
      }
      if(element.data.image && element.data.image_url==""){
        this.toastMessageService.showToastMessage("All the image questions should have an image");
        this.disableSaveBtn=!this.disableSaveBtn;
        return;
      }
    }

    await this.loadingService.showLoading('Saving');

    if(this.questionGroup.length==0){
      this.disableSaveBtn=!this.disableSaveBtn;
      this.loadingService.hideLoading();
      return;
    }

    this.questionGroup.forEach(async (element, index, array) => {
      // let index: number = this.questionGroup.indexOf(element);      
  
      // Remove previously added image
      if(!this.questionGroup[index].data.image){
        if(this.questionGroup[index].data.image_url != "" && this.questionGroup[index].data.metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.metadata)); 
          this.questionGroup[index].data.image_url = "";
          this.questionGroup[index].data.metadata = "";     
        }
      }
      if(!this.questionGroup[index].data.image_A){
        if(this.questionGroup[index].data.imageA != "" && this.questionGroup[index].data.a_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.a_metadata)); 
          this.questionGroup[index].data.imageA = "";
          this.questionGroup[index].data.a_metadata = "";     
        }
      }
      if(!this.questionGroup[index].data.image_B){
        if(this.questionGroup[index].data.imageB != "" && this.questionGroup[index].data.b_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.b_metadata));
          this.questionGroup[index].data.imageB = "";
          this.questionGroup[index].data.b_metadata = "";
        }
      }
      if(!this.questionGroup[index].data.image_C){
        if(this.questionGroup[index].data.imageC != "" && this.questionGroup[index].data.c_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.c_metadata));
          this.questionGroup[index].data.imageC = "";
          this.questionGroup[index].data.c_metadata = "";
        }
      }
      if(!this.questionGroup[index].data.image_D){
        if(this.questionGroup[index].data.imageD != "" && this.questionGroup[index].data.d_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.d_metadata));
          this.questionGroup[index].data.imageD = "";
          this.questionGroup[index].data.d_metadata = "";
        }
      }
      if(!this.questionGroup[index].data.image_E){
        if(this.questionGroup[index].data.imageE != "" && this.questionGroup[index].data.e_metadata != ""){
          this.questionService.removeImage(JSON.parse(this.questionGroup[index].data.e_metadata));
          this.questionGroup[index].data.imageE = "";
          this.questionGroup[index].data.e_metadata = "";
        }
      }
      let que: Question = {
        "instructor": this.loggedInUser.id,
        "subject": this.paper.data.subject,
        "question": element.data.question,
        "a": element.data.a,
        "b": element.data.b,
        "c": element.data.c,
        "d": element.data.d,
        "e": element.data.e,
        "answer": element.data.answer,
        "paper": this.paper.id,
        "number": (index + 1).toString(),
        "image": element.data.image,
        "image_url": element.data.image_url,
        "image_A": element.data.image_A,
        "imageA": element.data.imageA,
        "image_B": element.data.image_B,
        "imageB": element.data.imageB,
        "image_C": element.data.image_C,
        "imageC": element.data.imageC,
        "image_D": element.data.image_D,
        "imageD": element.data.imageD,
        "image_E": element.data.image_E,
        "imageE": element.data.imageE,
        "metadata": element.data.metadata,
        "a_metadata": element.data.a_metadata,
        "b_metadata": element.data.b_metadata,
        "c_metadata": element.data.c_metadata,
        "d_metadata": element.data.d_metadata,
        "e_metadata": element.data.e_metadata
      };
      console.log(JSON.stringify(que));
      if (element.id != "") {
        await this.questionService.updateQuestion(que, element.id).then(onfulfilled => {
          console.log(onfulfilled);
        }, onrejected => {
          console.log(onrejected);
        });
      }
      else {
        await this.questionService.addQuestion(que).then(onfulfilled => {
          console.log(onfulfilled.id);
          this.paper.data.added_questions++;
        }, onrejected => {
          console.log(onrejected);
        });
      }
      await this.paperService.updatePaper(this.paper.data, this.paper.id).then(onfulfilled => {
        console.log(onfulfilled);
        this.filterQuestionsByPaper(false);
      }, onrejected => {
        console.log(onrejected);
        this.filterQuestionsByPaper(false);
      });
      if(index===array.length-1){
        this.loadingService.hideLoading();
      }
    });
    

    // Publish confirmation
    if(this.paper.data.no_of_questions == this.paper.data.added_questions){
      this.publishPaperConfirm();
      return;
    }
    
    this.disableSaveBtn=!this.disableSaveBtn;
  }

  private formValidation(question: Question): boolean{
    if(question.instructor == undefined || question.instructor == '' || question.instructor == null){
      return false;
    }
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

  public getPaperSubject(){
    console.log("___getPaperSubject()___");
    this.paper = this.papers.filter(x => x.id == this.paperId)[0];
  }

  public async filterPapersBySubject(){
    console.log("___filterPapers()___");
    if(this.subjectId==undefined){
      return;
    }
    await this.loadingService.showLoading("Loading");
    this.paperId = undefined;
    this.papers = [];
    this.paper = undefined;
    await this.paperService.getPapersBySubjectId_InstructorId(this.subjectId, this.loggedInUser.id).then(res =>{
      this.papers = res.filter( el => !el.data.published);
    });
    if(this.tempPaperId != undefined){        
      this.paperId = this.tempPaperId;
      this.getPaperSubject();
      this.paper.id = this.paperId;
      this.tempPaperId = undefined;
      this.filterQuestionsByPaper();
    }
    this.loadingService.hideLoading();
  }

  public async filterQuestionsByPaper(loading: boolean = true){
    console.log("___filterQuestionsByPaper()___"); 
    if(this.paperId == undefined){
      return;
    }
    loading?await this.loadingService.showLoading("Loading"):"";
    await this.questionService.getQuestionsByPapers(this.paperId).then(res =>{
      this.questionGroup = res;
    });
    this.questionGroup = this.questionGroup.sort((a, b): number =>{
      if( Number(a.data.number)>Number(b.data.number)){
        return 1;
      }
      else{
        return -1;
      }
    });
    console.log(this.questionGroup);
    loading?this.loadingService.hideLoading():'';
  }

  private async loadPreviousQuestions(){
    console.log("___loadPreviousQuestions___");
    await this.loadingService.showLoading("Loading");
    this.questionSubscription = this.questionService.getQuestions().subscribe(res => {
      res = res.filter(x => x.data.paper == this.paperId);
      res = res.sort((a, b): number =>{
        if( Number(a.data.number)>Number(b.data.number)){
          return 1;
        }
        else{
          return -1;
        }
      });
      console.log(JSON.stringify(res));
      this.questionGroup = res;
      this.loadingService.hideLoading();
    },
    err => {
      this.loadingService.hideLoading();
    });
  }

  private createDummyQuestion(){
    let question: {id: string, data: Question}= {
      "id": "",
      "data": {
        "subject": this.paper.data.subject,
        "instructor": this.loggedInUser.id,
        "question": "",
        "a": "",
        "b": "",
        "c": "",
        "d": "",
        "e": "",
        "answer": "",
        "paper": "",
        "number": "",
        "image": false,
        "image_url": "",
        "metadata": "",
        "image_A": false,
        "imageA": "",
        "image_B": false,
        "imageB": "",
        "image_C": false,
        "imageC": "",
        "image_D": false,
        "imageD": "",
        "image_E": false,
        "imageE": "",
        "a_metadata": "",
        "b_metadata": "",
        "c_metadata": "",
        "d_metadata": "",
        "e_metadata": ""
      }
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

  public async publishPaperConfirm(){
    let alert = await this.alertController.create({
      header: 'Publish',
      subHeader: 'Your paper is ready to be published. Continue?',
      message: 'After you publish you can not edit/ delete the paper.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.disableSaveBtn=!this.disableSaveBtn;
            console.log('Cancel');
          }
        },
        {
          text: 'Yes',
          handler: async () => {
            console.log('Continue');
            await this.loadingService.showLoading("Publishing");
            this.paper.data.published = true;
            await this.paperService.updatePaper(this.paper.data, this.paper.id).then(
              async onfulfilled => {
                console.log(onfulfilled);
                let subjectName: string = "";
                this.subjectSubscription = this.userService.getSubject(this.paper.data.subject).subscribe(async res => {
                  subjectName = res.name;
                  let description: string = "";
                  const modal = await this.modalController.create({
                    component: CreateNewsfeedPage,
                    cssClass: 'my-newsfeed-modal-css',
                    componentProps: {
                      description: "Published a paper in " + subjectName + "."
                    },
                    backdropDismiss : false,

                  });
                  modal.onDidDismiss().then(async data => {     
                    description = data.data["description"];
                    let news: Newsfeed = {
                      userId: this.loggedInUser.id,
                      description:  description,
                      type: "Paper",
                      ref_id: this.paper.id,
                      posted_timestamp: firestore.Timestamp.now(),
                      timestamp: firestore.Timestamp.now(),
                      likes: 0,
                      likedUsers: "[]"
                    }                    
                    this.loadingService.showLoading("Saving Newsfeed");
                    await this.newsfeedService.addNewsfeed(news);
                    this.paperId = undefined;
                    this.disableSaveBtn=!this.disableSaveBtn;
                    this.loadingService.hideLoading();
                    this.filterPapersBySubject();
                  })
                  await modal.present();
                  this.loadingService.hideLoading();
                  
                },
                err=>{
                  console.log(err);
                  this.disableSaveBtn=!this.disableSaveBtn;
                  this.loadingService.hideLoading();
                  this.filterPapersBySubject();
                })
              },
              onrejected => {
                console.log(onrejected);
                this.paper.data.published = false;
                this.disableSaveBtn=!this.disableSaveBtn;
                this.loadingService.hideLoading();
              }
            );
          }
        }
      ]
    });
    alert.present();
  }

}

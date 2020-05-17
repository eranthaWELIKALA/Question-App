import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { QuestionService, Question } from '../question.service';
import { User } from '../../../initial/user.service';
import { ActivatedRoute } from '@angular/router';
import { PaperService, Paper } from '../../paper/paper.service';
import { SharedService } from 'src/app/shared/shared.service';
import { faKeyboard, faBars, faUndo, faTrash, faCaretSquareDown, faCaretSquareUp, faImage } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { Subscription } from 'rxjs';
import { ImageViewerPage } from 'src/app/util/image-viewer/image-viewer.page';

@Component({
  selector: 'app-view-question',
  templateUrl: './view-question.page.html',
  styleUrls: ['./view-question.page.scss'],
})
export class ViewQuestionPage implements OnInit, OnDestroy {

  // Icons
  faKeyboard = faKeyboard;
  faBars = faBars;  
  faImage = faImage;
  faUndo = faUndo;   
  faTrash = faTrash;
  faCaretSquareDown = faCaretSquareDown;
  faCaretSquareUp = faCaretSquareUp;

  public paperDetailsShow: boolean = true;
  
  //private image;
  public questionGroup: {id: string, data: Question}[] = [];

  public paper: {id: string, data: Paper};
  public paperId: string;

  private loggedInUser: {id: string, data: User};

  private routerSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private questionService: QuestionService, 
    public sharedService: SharedService,
    private paperService: PaperService,
    private loadingService: LoadingService) {
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
   }

  async ngOnInit() {  
    await this.loadingService.showLoading('Loading');

    this.routerSubscription = this.route.queryParams.subscribe(async params => {
      if (params && params.paperId) {
        this.paperId = params.paperId;
        let paperSubscription = this.paperService.getPaper(this.paperId).subscribe(res=>{
          if(res==undefined){
            this.loadingService.hideLoading();
            this.navController.navigateRoot("home/newsfeed");
            return;
          }
          this.paper = {id: this.paperId, data: res};  
          paperSubscription.unsubscribe();        
          this.filterQuestionsByPaper();
        });
      }
      else{
        this.loadingService.hideLoading();
        this.navController.navigateRoot("home/newsfeed");
        return;
      }
    });    
  }
  
  ngOnDestroy(){
    this.routerSubscription.unsubscribe();
  }

  public async openImageViewer(url: string){
    const modal = await this.modalController.create({
      component: ImageViewerPage,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'image_url': url
      },
      backdropDismiss : true
    });
    return await modal.present();
  }

  
  private async filterQuestionsByPaper(){
    console.log("___filterQuestionsByPaper()___"); 
    if(this.paperId == undefined){
      return;
    }
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
    this.loadingService.hideLoading();
  }

}

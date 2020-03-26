import { Component, OnInit, OnDestroy } from '@angular/core';
import { faBars, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { User, Subject, UserService } from 'src/app/initial/user.service';
import { Paper, PaperService } from '../paper.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-view-created-paper',
  templateUrl: './view-created-paper.page.html',
  styleUrls: ['./view-created-paper.page.scss'],
})
export class ViewCreatedPaperPage implements OnInit, OnDestroy {

  faBars = faBars;
  faEye = faEye;
  faEdit = faEdit;

  private loggedInUser: {id: string, data: User};

  private papers: {id: string, data: Paper}[];

  private subjectIdArray: string[] = [];
  private subjects: {id: string, data: Subject}[];

  private subjectFilter: string;

  private userSubscription: Subscription;

  constructor(
    private sharedService: SharedService,
    private paperService: PaperService,
    private userService: UserService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private router: Router
  ) { 
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  async ngOnInit() {    
    await this.loadingService.showLoading("Loading");
    this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined ? this.subjectIdArray = JSON.parse(this.loggedInUser.data.units): "";

    // Get Subjects and filter subjects relavent to the user
    this.userSubscription = this.userService.getSubjects().subscribe(async res => {
      let result: any = []
      this.subjectIdArray.forEach(element => {
        result = result.concat(res.filter(x => x.id == element));
      });
      this.subjects = result;
      console.log(result);
      this.loadingService.hideLoading();
    },
    error => {
      console.log(error);
      this.loadingService.hideLoading();
    });
  }

  ngOnDestroy(){
    this.userSubscription.unsubscribe();
  }

  private async filterPapers(){
    await this.loadingService.showLoading("Loading");
    await this.paperService.getPapersBySubjectId_InstructorId(this.subjectFilter, this.loggedInUser.id).then(res => {
      this.papers = res;
    });
    this.loadingService.hideLoading();
  }

  private async deletePaper(paperId: string){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Do you realy want to DELETE this paper?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Cancel');
          }
        },
        {
          text: 'Yes',
          handler: async () => {
            console.log(paperId);
            await this.paperService.removePaper(paperId);
            this.filterPapers();
          }
        }
      ]
    });
    alert.present();    
  }

  private editPaper(subjectId: string, paperId: string){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        subjectId: subjectId,
        paperId: paperId
      }
    };
    this.router.navigate(['/home/question/add'], navigationExtras);
  }

  private viewPaper(paperId: string){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        paperId: paperId
      }
    };
    this.router.navigate(['/home/question/view'], navigationExtras);
  }

}

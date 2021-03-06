import { Component, OnInit, OnDestroy } from '@angular/core';
import { Paper, PaperService } from '../paper.service';
import { UserService, User, Subject } from 'src/app/initial/user.service';
import { NavController } from '@ionic/angular';
import { SharedService } from 'src/app/shared/shared.service';
import { faAsterisk, faBars } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';
import { isNumber } from 'util';
import { AdMobFree } from '@ionic-native/admob-free/ngx';

@Component({
  selector: 'app-create-paper',
  templateUrl: './create-paper.page.html',
  styleUrls: ['./create-paper.page.scss'],
})
export class CreatePaperPage implements OnInit, OnDestroy {

  faAsterisk = faAsterisk;
  faBars = faBars;

  private loggedInUser: {id: string, data: User};

  public paper: Paper;

  public charging = false;

  private subjectIDGroup: string[];
  public subjectGroup: {id: string, data: Subject}[];

  private subjectSubscription: Subscription;

  public disableSaveBtn: boolean = false;

  constructor(
    private userService: UserService, 
    private paperService: PaperService,
    public sharedService: SharedService,
    private loadingService: LoadingService,
    private toastMessageService: ToastMessageService,
    private navController: NavController,
    private adMob: AdMobFree){
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
      this.adMob.banner.config(this.sharedService.getBannerConfig());
    }

  async ngOnInit() {
    this.paper = this.createNullPaper(this.loggedInUser.id);
    this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined? this.subjectIDGroup = this.loggedInUser.data.units: "";
    await this.loadingService.showLoading("Loading");

    this.subjectSubscription = this.userService.getSubjects().subscribe(async res =>
      {
        console.log("Response: " + JSON.stringify(res));
        this.subjectGroup = this.getSubjectNamesArray(res, this.subjectIDGroup);
        console.log(JSON.stringify(this.subjectGroup));
        this.loadingService.hideLoading();
    },
    err =>{
      console.log(err);
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
    this.subjectSubscription.unsubscribe();
    this.adMob.banner.remove();
  }

  public async formSubmit(){  
    if(!isNumber(this.paper.no_of_questions)){
      this.showToastMessage("No of Questions should be a Number");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }
    if(this.paper.name == "" || this.paper.subject == "" || this.paper.time == "" || this.paper.no_of_questions == 0 || (this.charging && this.paper.price == "")){
      this.showToastMessage("Please fill-out all the feilds with stars");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }
    let duplicate: boolean = false;
    await this.duplicatePaperNames().then(res=>{
      duplicate = res;
    })
    if(duplicate){
      this.showToastMessage("Paper name is already exists");
      this.disableSaveBtn!=this.disableSaveBtn;
      return;
    }
    await this.loadingService.showLoading("Creating");
    this.paperService.addPaper(this.paper).then(
      onfulfilled => {
        this.paper = this.createNullPaper(this.loggedInUser.id);
        this.loadingService.hideLoading();
        this.navController.navigateRoot("home/question/add");
      },
      onrejected =>{
        this.disableSaveBtn!=this.disableSaveBtn;
        this.loadingService.hideLoading();
      });
  }

  public pickYear(){
    this.paper.year = this.paper.year.split("-")[0];
  }

  private getSubjectNamesArray(subjectGroup: {id: string, data: Subject}[], subjectIDGroup: string[]): {id: string, data: Subject}[]{
    let namesArray: {id: string, data: Subject}[] = [];
    if(subjectIDGroup != null && subjectIDGroup != undefined){
      subjectIDGroup.forEach(element => {
        namesArray = namesArray.concat(subjectGroup.filter(x => x.id == element));
      });
    }
    else{
      // nothing to do
    }
    return namesArray;
  }

  private async duplicatePaperNames(): Promise<boolean>{
    console.log("___duplicatePaperNames()___");
    let state = false;
    let papers: { id: string, data: Paper}[];
    await this.paperService.getPapersBySubjectId_InstructorId(this.paper.subject, this.paper.instructor).then(res =>{
      papers = res;
    });
    papers.forEach(element =>{
        if((element.data.name == this.paper.name) && (element.data.year == this.paper.year)){
          state = true;
        }
    })
    return state;
  }

  private async showToastMessage(message: string, time: number = 2000){
    this.toastMessageService.showToastMessage(message, time);
  }

  private createNullPaper(userId: string): Paper{
    return {
      "name": "",
      "year": "",
      "instructor": userId,
      "subject": "",
      "grade_level": "Other",
      "no_of_questions": 0,
      "added_questions": 0,
      "time": "",
      "price": "",
      "published": false
    }
  }

}

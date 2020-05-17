import { Component, OnInit, OnDestroy } from '@angular/core';
import { Attempt, AttemptService } from '../attempt.service';
import { SharedService } from 'src/app/shared/shared.service';
import { User, UserService, Subject } from 'src/app/initial/user.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { faBars, faPlusSquare, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Paper, PaperService } from '../../paper/paper.service';
import { NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-attempt',
  templateUrl: './attempt.page.html',
  styleUrls: ['./attempt.page.scss'],
})
export class AttemptPage implements OnInit, OnDestroy {

  faBars = faBars;
  faPlusSquare = faPlusSquare;
  faArrowLeft = faArrowLeft;

  private loggedInUser: {id: string, data: User};

  public attempts: {id: string, paper: string, data: Attempt, lastAttempt: string}[] = [];
  private papers: {id: string, data: Paper}[] = [];
  
  private subjectGroup: {id: string, data: Subject}[];

  private backButtonSubscription: Subscription;
  private paperSubscription: Subscription;
  private userSubscription: Subscription;
  
  constructor(
    private attemptService: AttemptService,
    public sharedService: SharedService,
    private loadingService: LoadingService,
    private paperService: PaperService,
    private userService: UserService,
    private navController: NavController,
    private platform: Platform){
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
  }

  async ngOnInit() {
    await this.loadingService.showLoading("Loading");
    
    this.backButtonSubscription = this.platform.backButton.subscribe(async ()=>{
      this.goBack();
    });

    this.paperSubscription = this.paperService.getPapers().subscribe(async res=>{
      this.papers = res;
      this.userSubscription = this.userService.getSubjects().subscribe(async (res) => {
        this.subjectGroup = res; 
        await this.attemptService.getAttemptsByUserId(this.loggedInUser.id).then(async res=>{
          console.log(res);
          res.forEach(async (el) => {
            let paper = this.papers.filter(paper_el => paper_el.id == el.data.paper)[0];
            if(paper != undefined){
              let paper_search = this.subjectGroup.filter(subject_el => subject_el.id == paper.data.subject)[0];
              let subject = "";
              if(paper_search!=undefined){
                subject = paper_search.data.name;
              }
              let paperName = paper.data.name + " " + paper.data.year + " - " + subject;
              this.attempts.push({ id: el.id, paper: paperName, data: el.data, lastAttempt: el.data.timestamp.toDate().toDateString() });
            }
          });        
          this.loadingService.hideLoading();
        },
        err=>{
          console.log(err);
          this.loadingService.hideLoading();
        });
      }, err => {
        console.log(err);
        this.loadingService.hideLoading();
      });
    },
    err =>{
      console.log(err);
      this.loadingService.hideLoading();
    });
  }

  ngOnDestroy(){
    this.backButtonSubscription.unsubscribe();
    this.paperSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  public goBack(){
    this.navController.back();
  }

}

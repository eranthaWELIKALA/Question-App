import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { PaperService, Paper } from '../paper.service';
import { User, UserService, Subject } from 'src/app/initial/user.service';
import { faEdit, faBars, faCaretSquareUp, faCaretSquareDown } from '@fortawesome/free-solid-svg-icons'
import { Router, NavigationExtras } from '@angular/router';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-paper',
  templateUrl: './view-paper.page.html',
  styleUrls: ['./view-paper.page.scss'],
})
export class ViewPaperPage implements OnInit, OnDestroy {

  @ViewChild("refresher", {read: false, static: false}) refresher: IonRefresher;

  faEdit = faEdit; 
  faBars = faBars;
  faCaretSquareDown = faCaretSquareDown;
  faCaretSquareUp = faCaretSquareUp;
  
  private filtersShow: boolean = true;

  private maxTime: number = 20;

  private loggedInUser: {id: string, data: User};
  private instructors: {id: string, data: User}[];
  private allInstructors: {id: string, data: User}[];

  private papers: {id: string, data: Paper}[];
  private allPapers: {id: string, data: Paper}[];

  private subjects: {id: string, data: Subject}[];

  private subjectFilter: string;

  private userSubscription: Subscription;

  private search_by_instructor: boolean = false;

  constructor(
    private sharedService: SharedService,
    private paperService: PaperService,
    private userService: UserService,
    private loadingService: LoadingService,
    private router: Router){
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
     }

  async ngOnInit() {
    await this.loadingService.showLoading("Loading");    

    this.allInstructors = this.userService.getInstructors();
    this.instructors = this.allInstructors;

    this.userSubscription = this.userService.getSubjects().subscribe(async res => {
      let result: any = []
      if(this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined && this.loggedInUser.data.units.length > 0){
        this.loggedInUser.data.units.forEach(element =>{
          result = result.concat(res.filter(x => x.id == element))
        })
      }
      else{
        // nothing to do
      }
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
    await this.paperService.getPapersBySubjectId(this.subjectFilter).then(res => {
      this.allPapers = res;
    });
    this.allPapers = this.allPapers.filter(x => x.data.published);
    let grade_level = this.loggedInUser.data.grade_level;
    if(grade_level != ""){
      if(grade_level!="other"){
        this.allPapers = this.allPapers.filter(x => x.data.grade_level == grade_level);
      }
    }
    this.papers = this.allPapers;
    this.loadingService.hideLoading();
    this.refresher.complete();
  }

  private initializeItems(){
    this.papers = this.allPapers;
    this.instructors = this.allInstructors;
  }

  private filterByInstructor(evt){    
    this.initializeItems();

    const searchTerm = evt.srcElement.value;
  
    if (!searchTerm) {
      return;
    }
  
    let instructors_temp = this.instructors.filter(instructor => {
      if (searchTerm) {
        if (instructor.data.firstname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        else if (instructor.data.lastname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        else if (instructor.data.email.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

    this.papers = this.papers.filter(paper=>{
      if(instructors_temp.filter(instructor=> instructor.id == paper.data.instructor).length > 0){
        return true;
      }
      else{
        return false;
      }
    })

  }

  private getInstructorName(id, part: string = "all"): string{
    if(this.instructors != undefined){      
      let instructor = this.instructors.filter(x=> x.id == id)[0];
      if(instructor!=undefined){
        if(part=="firstname"){
          return instructor.data.firstname;
        }
        else if(part=="lastname"){        
          return instructor.data.lastname;
        }
        else{        
          return instructor.data.firstname + " " + instructor.data.lastname;
        }
      }
      else{
        return "";
      }
    }
  }

  private answerPaper(paper: any){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        paper: JSON.stringify(paper)
      }
    };
    this.router.navigate(['/home/paper/answer'], navigationExtras);
    
  }

}

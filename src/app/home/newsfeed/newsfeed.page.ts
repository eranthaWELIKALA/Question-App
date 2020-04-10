import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { faBars, faThumbsUp, faThumbsDown, faEdit, faQuestionCircle, faCaretSquareDown, faCaretSquareUp, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { Newsfeed, NewsfeedService } from './newsfeed.service';
import * as firebase from 'firebase/app';
import { User, UserService } from 'src/app/initial/user.service';
import { NavigationExtras, Router } from '@angular/router';
import { PaperService, Paper } from '../paper/paper.service';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { IonRefresher} from '@ionic/angular';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { IconService } from 'src/app/util/icon/icon.service';
import { PendingDeletionService, PendingDeletion } from 'src/app/util/pendingDeletion/pending-deletion.service';

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.page.html',
  styleUrls: ['./newsfeed.page.scss'],
})
export class NewsfeedPage implements OnInit, OnDestroy {
  @ViewChild("refresher", {read: false, static: false}) refresher: IonRefresher;

  faBars = faBars;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;  
  faEdit = faEdit;
  faQuestionCircle = faQuestionCircle;
  faCaretSquareUp = faCaretSquareUp;
  faCaretSquareDown = faCaretSquareDown;
  faCaretUp = faCaretUp;
  faCaretDown = faCaretDown;

  private swapIcon: boolean = false;
  
  private datePipe = new DatePipe('en-US');
  private disableLikeButton: boolean = false;

  private loggedInUser: {id: string, data: User}

  private newsfeed:{id: string, data: Newsfeed, user: User}[];

  private newsfeedSubscription: Subscription;

  private feedCount = 50;

  private previousItemId: string = "";
  private hideButton: boolean = true;

  constructor(
    private sharedService: SharedService,
    private newsfeedService: NewsfeedService,
    private paperService: PaperService,
    private userService: UserService,
    private loadingService: LoadingService,
    private pDeletionService: PendingDeletionService,
    private router: Router
  ) { 
    // Get Logged in User's details
    this.loggedInUser = this.sharedService.getLoggedInUser();
   }

  ngOnInit() {

    this.newsfeedSubscription = this.newsfeedService.getNewsfeeds().subscribe(res=>{
      res = res.sort((a, b): number =>{
        if( Number(a.data.timestamp.toMillis())<Number(b.data.timestamp.toMillis())){
          return 1;
        }
        else{
          return -1;
        }
      });
      res.splice(this.feedCount, );
      this.loadnewsFeed(res);
    });
  }

  ngOnDestroy(){
    this.newsfeedSubscription.unsubscribe();
  }

  private async loadnewsFeed(data: {id: string, data: Newsfeed}[]){
    await this.loadingService.showLoading("Refreshing", "bubbles");
    let newsfeed:{id: string, data: Newsfeed, user: User}[] = [];
    data.forEach(el => {
      let userSubscription = this.userService.getUser(el.data.userId).subscribe(res => {
        newsfeed.push({ id: el.id, data: el.data, user: res });
        userSubscription.unsubscribe();
      });
    })
    console.log(newsfeed);
    this.newsfeed = newsfeed;
    this.loadingService.hideLoading();
    this.refresher.complete();
    this.previousItemId != null && this.previousItemId!= '' ? this.hideButton = !this.hideButton: '';
    // Refreshing in min by min
    // setTimeout(async x => 
    //   {
    //     this.loadnewsFeed(data);
    //   }, 60000);
  }

  private refresh(){
    if(isNaN(this.feedCount) || this.feedCount < 10){
      this.feedCount = 10;
    }
    this.newsfeedSubscription.unsubscribe();
    this.newsfeedSubscription = this.newsfeedService.getNewsfeeds().subscribe(async res=>{  
      res = res.sort((a, b): number =>{
        if( Number(a.data.timestamp.toMillis())<Number(b.data.timestamp.toMillis())){
          return 1;
        }
        else{
          return -1;
        }
      });    
      res.splice(this.feedCount, );
      await this.loadnewsFeed(res);
    });
  }

  private timeConvert(timeStamp: firebase.firestore.Timestamp): string{
    let timeGap: Date = new Date(firebase.firestore.Timestamp.now().toMillis() - timeStamp.toMillis());
    let days = Number(timeGap.getTime()/(1000*60*60*24)).toFixed(); 
    let str = "";
    let daysInNumber: Number = Number(days);

    if(daysInNumber>0){
      let date = timeStamp.toDate();      
      let time = this.datePipe.transform(date, 'HH:mm');
      if(daysInNumber == 1){
        str = "Yesterday @ " + time
      }
      else{
        let date_ = this.datePipe.transform(date, 'yyyy MMM dd');
        str = date_ + " @ " + time;
      }
    }
    else{
      let hours = timeGap.getUTCHours();
      let mins = timeGap.getUTCMinutes();
      let secs = timeGap.getUTCSeconds();

      hours > 0? str = str+hours + " hours ":"";
      mins > 0? str = str+mins + " mins ":"";
      
      if(hours==0 && mins==0){
        str = secs+ " secs";
      }
      str = str + " ago";
    }
    return str;
    
  }

  private async increaseLikes(news: {id: string, data: Newsfeed}, index: number){
    console.log("__increaseLikes()___");
    let availability = false;
    await this.newsfeedService.checkAvailability(news.data.type, news.data.ref_id).then(onfulfilled=>{
      availability = onfulfilled;    
    })
    if(availability){
      if(!this.checkInterference(news)){
        //this.newsfeed[this.newsfeed.indexOf(news)].data.likes++;
        news.data.likes++;
        let likedUsers: string[] = JSON.parse(news.data.likedUsers);
        likedUsers.push(this.loggedInUser.id)
        news.data.likedUsers = JSON.stringify(likedUsers);
        this.newsfeedService.updateNewsfeed(news.data, news.id);
      }
      else{
        //this.newsfeed[this.newsfeed.indexOf(news)].data.likes--;
        news.data.likes--;
        let likedUsers: string[] = JSON.parse(news.data.likedUsers);
        likedUsers.splice(likedUsers.indexOf(this.loggedInUser.id), 1)
        news.data.likedUsers = JSON.stringify(likedUsers);
        this.newsfeedService.updateNewsfeed(news.data, news.id);
      }
      this.previousItemId = news.id;
    }
    else{
      let alreadyAdded: boolean = true;
      await this.pDeletionService.checkPendingDeletionByNewsId(news.id).then(doc=>
        alreadyAdded = doc
      );
      if(!alreadyAdded){
        console.log("IN");
        let pDeletion: PendingDeletion = {
          type: news.data.type,
          ref_id: news.data.ref_id,
          news_id: news.id
        }
        this.pDeletionService.addPendingDeletion(pDeletion);
      }
    }
    this.disableLikeButton = !this.disableLikeButton;
  }

  private checkInterference(news: {id: string, data: Newsfeed}): boolean{
    let usersArray: string[] = JSON.parse(news.data.likedUsers);  
      usersArray = usersArray.filter(x=> x == this.loggedInUser.id);
      if(usersArray.length>0){
        return true;
      }
      else {
        return false;
      }
  }

  private loadPreviousItem(){
    console.log("___loadPreviousItem()___");
    this.previousItemId != null && this.previousItemId != '' ? document.getElementById(this.previousItemId).scrollIntoView({behavior: "smooth", block: 'center'}) : console.log("Previous Item Id is null or empty");
    this.hideButton = !this.hideButton
  }

  private jumpTo(direction: string){
    direction == "up" ? document.getElementById(this.newsfeed[0].id).scrollIntoView({behavior: "smooth", block: 'start'}) : document.getElementById(this.newsfeed[this.newsfeed.length-1].id).scrollIntoView({behavior: "smooth", block: 'end'})
  }

  private goToLink(id: string, type: string){
    console.log(type);
    if(this.newsfeedService.checkAvailability(type, id)){
      if(type == "Paper"){
        let paper: {id: string, data: Paper} = {
          id: "0",
          data: {
            "name": "",
            "year": "",
            "instructor": "",
            "subject": "",
            "grade_level": "",
            "no_of_questions": 0,
            "added_questions": 0,
            "time": "",
            "price": "",
            "published": false
          }
        }
        let paperSubscription = this.paperService.getPaper(id).subscribe(res=>{
          if(res!=undefined && res!=null){
            paper.id = id;
            paper.data = res;

            let navigationExtras: NavigationExtras = {
              queryParams: {
                paper: JSON.stringify(paper)
              }
            };
            this.router.navigate(['/home/paper/answer'], navigationExtras);
          }        
          paperSubscription.unsubscribe();
        });
        
      }   
    }
    
  }

}

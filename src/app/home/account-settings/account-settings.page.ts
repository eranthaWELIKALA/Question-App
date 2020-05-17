import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { faBars, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AngularFireAuth } from 'angularfire2/auth';
import { NavController, AlertController } from '@ionic/angular';
import { UserService, User } from 'src/app/initial/user.service';
import { PaperService, Paper } from '../paper/paper.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { NoteService, Note } from '../note/note.service';
import { AttemptService, Attempt } from '../user/attempt.service';
import { Newsfeed, NewsfeedService } from '../newsfeed/newsfeed.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  faBars = faBars;
  faArrowLeft = faArrowLeft;

  private loggedInUser: {id: string, data: User};

  constructor(
    public sharedService: SharedService, 
    private loadingService: LoadingService,
    private userService: UserService,
    private paperService: PaperService,
    private noteService: NoteService,
    private attemptService: AttemptService,
    private newsfeedService: NewsfeedService,
    private fAuth: AngularFireAuth,
    private navController: NavController,
    private alertController: AlertController) { 
      this.loggedInUser = this.sharedService.getLoggedInUser();
    }

  ngOnInit() {
  }  

  goBack(){
    this.navController.back();
  }

  public async deleteAccount(){
    console.log("___deleteAccount()___");
    let alert = await this.alertController.create({
      header: 'Delete Account',
      subHeader: 'Do you realy want to delete your account?',
      message: 'This action can not be reverted!!!',
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
            console.log('Delete Account');
            await this.loadingService.showLoading("Deleting your account");
            await this.userService.removeUser(this.loggedInUser.id);

            // add remote user and transfer all the papers to the remote user
            let papers: {id: string, data: Paper}[] = await this.paperService.getPapersByInstructorId(this.loggedInUser.id);
            papers.forEach(async paper=>{
              if(paper.data.published){
                paper.data.instructor = this.sharedService.getRemoteUserID();
                await this.paperService.updatePaper(paper.data, paper.id);
              }
              else{
                await this.paperService.removePaper(paper.id);
              }
            })

            // add remote user and transfer all the notes to the remote user
            let notes: {id: string, data: Note}[] = await this.noteService.getNotesByInstructorId(this.loggedInUser.id);
            notes.forEach(async note=>{
                note.data.instructor = this.sharedService.getRemoteUserID();
                await this.noteService.updateNote(note.data, note.id);
            })

            if(this.loggedInUser.data.role=="instructor"){
              // Handle newdfeeds
              let newsfeeds: {id: string, data: Newsfeed}[] = await this.newsfeedService.getNewsfeedsByUserId(this.loggedInUser.id);
              newsfeeds.forEach(async newsfeed=>{
                newsfeed.data.userId = this.sharedService.getRemoteUserID();
                newsfeed.data.description = "Ownership is transfered to Mtute community";
                await this.newsfeedService.updateNewsfeed(newsfeed.data, newsfeed.id);
              })
            }
            else{
              // Handle attempts
              let attempts: {id: string, data: Attempt}[] = await this.attemptService.getAttemptsByUserId(this.loggedInUser.id);
              attempts.forEach(async newsfeed=>{
                this.attemptService.removeAttempt(newsfeed.id);
              })
            }

            // remove the pic
            if(this.loggedInUser.data.metadata != "" ){
              this.userService.removeImage(JSON.parse(this.loggedInUser.data.metadata)).subscribe(()=>{
                console.log("Removed the profile pic");
              },
              error=>{
                console.log("Image deletion is failed " + error);
              })
            }
            else{
              // nothing to do
            }
            
            this.fAuth.auth.currentUser.delete();
            this.sharedService.setLoggedInUser(undefined);
            this.loadingService.hideLoading();
            this.navController.navigateRoot('/');
          }
        }
      ]
    });
    alert.present();
  }

}

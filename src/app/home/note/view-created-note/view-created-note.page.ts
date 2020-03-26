import { Component, OnInit, OnDestroy } from '@angular/core';
import { faBars, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { UserService, Subject, User } from 'src/app/initial/user.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { NoteService, Note } from '../note.service';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NewsfeedService } from '../../newsfeed/newsfeed.service';

@Component({
  selector: 'app-view-created-note',
  templateUrl: './view-created-note.page.html',
  styleUrls: ['./view-created-note.page.scss'],
})
export class ViewCreatedNotePage implements OnInit, OnDestroy {

  faBars = faBars;
  faFilePdf = faFilePdf;

  private loggedInUser: {id: string, data: User};

  private notes: {id: string, data: Note}[];

  private subjectIdArray: string[] = [];
  private subjects: {id: string, data: Subject}[];

  private subjectFilter: string;

  private userSubscription: Subscription;

  constructor(    
    private sharedService: SharedService,
    private noteService: NoteService,
    private userService: UserService,
    private loadingService: LoadingService,   
    private newsfeedService: NewsfeedService, 
    private alertController: AlertController,
    private file: File,
    private fileTransfer: FileTransfer,
    private fileOpener: FileOpener,
    private documentViewer: DocumentViewer,
    private platform: Platform
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

  private async filterNotes(){
    await this.loadingService.showLoading("Loading");
    await this.noteService.getNotesBySubjectId_InstructorId(this.subjectFilter, this.loggedInUser.id).then(res => {
      this.notes = res;
    });
    this.loadingService.hideLoading();
  }

  private async download_openPDF(url: string, fileName: string){
    await this.loadingService.showLoading("Downloading");
    let downloadURL = url;
    let path = this.file.dataDirectory;
    const transfer = this.fileTransfer.create();

    transfer.download(downloadURL, path + fileName + ".pdf").then(res =>{
      let uri = res.toURL();
      if(this.platform.is("android")){
        this.loadingService.hideLoading();
        this.fileOpener.open(uri, "application/pdf");
      }
      else{
        this.loadingService.hideLoading();
        this.documentViewer.viewDocument(uri, "application/pdf", {});
      }
    })
  }

  private async deleteNote(noteId: string){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Do you realy want to DELETE this note?',
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
            console.log(noteId);
            await this.noteService.removeNote(noteId);
            await this.newsfeedService.removeNewsfeedByRefId(noteId);
            this.filterNotes();
          }
        }
      ]
    });
    alert.present();    
  }

}

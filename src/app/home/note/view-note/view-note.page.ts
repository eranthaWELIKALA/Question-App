import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { faBars, faFilePdf, faCaretSquareDown, faCaretSquareUp } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { UserService, Subject, User } from 'src/app/initial/user.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { NoteService, Note } from '../note.service';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { Platform, IonRefresher } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-note',
  templateUrl: './view-note.page.html',
  styleUrls: ['./view-note.page.scss'],
})
export class ViewNotePage implements OnInit, OnDestroy {

  @ViewChild("refresher", {read: false, static: false}) refresher: IonRefresher;

  faBars = faBars;
  faFilePdf = faFilePdf;
  faCaretSquareDown = faCaretSquareDown;
  faCaretSquareUp = faCaretSquareUp;

  public filtersShow: boolean = true;

  public loggedInUser: {id: string, data: User};
  private instructors: {id: string, data: User}[];
  private allInstructors: {id: string, data: User}[];

  public notes: {id: string, data: Note}[];
  private allNotes: {id: string, data: Note}[];

  private subjectIdArray: string[] = [];
  public subjects: {id: string, data: Subject}[];

  public subjectFilter: string;

  private userSubscription: Subscription;

  public search_by_instructor: boolean = false;

  constructor(    
    public sharedService: SharedService,
    private noteService: NoteService,
    private userService: UserService,
    private loadingService: LoadingService,
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
    this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined ? this.subjectIdArray = this.loggedInUser.data.units: "";    

    this.allInstructors = this.userService.getInstructors();
    this.instructors = this.allInstructors;

    // Get Subjects and filter subjects relavent to the user
    this.userSubscription = this.userService.getSubjects().subscribe(async res => {
      let result: any = []
      if(this.subjectIdArray.length > 0){
        this.subjectIdArray.forEach(element => {
          result = result.concat(res.filter(x => x.id == element));
        });
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

  public async filterNotes(){
    await this.loadingService.showLoading("Loading");
    await this.noteService.getNotesBySubjectId(this.subjectFilter).then(res => {
      this.allNotes = res;
    });    
    let grade_level = this.loggedInUser.data.grade_level;
    if(grade_level != ""){
      if(grade_level!="Other"){
        this.allNotes = this.allNotes.filter(x => x.data.grade_level == grade_level);
      }
    }
    this.notes = this.allNotes;
    this.loadingService.hideLoading();
    this.refresher.complete();
  }

  public initializeItems(){
    this.notes = this.allNotes;
    this.instructors = this.allInstructors; 
  }

  public filterByInstructor(evt){    
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

    this.notes = this.notes.filter(note=>{
      if(instructors_temp.filter(instructor=> instructor.id == note.data.instructor).length > 0){
        return true;
      }
      else{
        return false;
      }
    })

  }

  public async download_openPDF(url: string, fileName: string){
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

  public getInstructorName(id): string{
    if(this.instructors != undefined){
      let instructor = this.instructors.filter(x=> x.id == id)[0].data;
      return instructor.firstname + " " + instructor.lastname;
    }
  }

}

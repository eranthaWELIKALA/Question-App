import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NoteService, Note } from './../note.service';
import { faBars, faAsterisk } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared/shared.service';
import { User, UserService, Subject } from 'src/app/initial/user.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { Subscription } from 'rxjs';
import { Newsfeed, NewsfeedService } from '../../newsfeed/newsfeed.service';
import * as firebase from 'firebase/app';
import { NavController, ModalController } from '@ionic/angular';
import { CreateNewsfeedPage } from '../../newsfeed/create-newsfeed/create-newsfeed.page';

@Component({
  selector: 'app-create-note',
  templateUrl: './create-note.page.html',
  styleUrls: ['./create-note.page.scss'],
})
export class CreateNotePage implements OnInit, OnDestroy {

  @ViewChild('pdfFile', {read: false, static: false}) pdfFileSelect: ElementRef;

  faAsterisk = faAsterisk;
  faBars = faBars;

  private loggedInUser:{id: string, data: User};
  
  private subjectIDGroup: string[];
  private subjectGroup: {id: string, data: Subject}[];

  private pdfFile: File = undefined;

  private note: Note;

  private userSubscription: Subscription;
  private fileUploadSubscription: Subscription;
  private subjectSubscription: Subscription;

  constructor(
    private noteService: NoteService,
    private sharedService: SharedService,
    private userService: UserService,
    private toastMessageService: ToastMessageService,
    private newsfeedService: NewsfeedService,
    private loadingService: LoadingService,
    private modalController: ModalController,
    private navController: NavController) {
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();
     }

  async ngOnInit() {     
    
    this.note = this.createNullNote(this.loggedInUser.id);
    this.loggedInUser.data.units != null && this.loggedInUser.data.units!= undefined? this.subjectIDGroup = this.loggedInUser.data.units: "";   
    
    await this.loadingService.showLoading('Loading'); 
    this.userSubscription = this.userService.getSubjects().subscribe((res) => {
      this.subjectGroup = this.getSubjectNamesArray(res, this.subjectIDGroup);
      console.log(JSON.stringify(this.subjectGroup));
      this.loadingService.hideLoading();
    }, err => {
      console.log(err);
      this.loadingService.hideLoading();
    });    
    console.log(this.note.contentURL)
  }

  ngOnDestroy(){
    console.log("___ngOnDestroy()___");
    this.userSubscription.unsubscribe();
    this.fileUploadSubscription!=undefined?this.fileUploadSubscription.unsubscribe():"";
    this.subjectSubscription!=undefined?this.subjectSubscription.unsubscribe():"";
  }

  private async formSubmit(){
    if(this.pdfFile == undefined){
      this.toastMessageService.showToastMessage("PDF file is a must", 2000);
      return;
    }
    if(!this.noteValidation()){
      this.toastMessageService.showToastMessage("Fill out required the fields", 2000);
      return;
    }
    await this.uploadPDF(this.pdfFile);
  }

  private noteValidation(): boolean{
    if(this.note.name == "" || this.note.subject == "" || this.note.instructor == ""){
      return false;
    }
    else return true;
  }

  private checkFileType(event: FileList){
    if(event.item(0).type != "application/pdf"){
      this.toastMessageService.showToastMessage("Please select PDF type only", 2000);
      this.pdfFile = undefined;
      this.pdfFileSelect.nativeElement.value= "";
    }
    else{
      this.pdfFile = event.item(0);
    }
  }

  private async uploadPDF(file: File){
    await this.loadingService.showLoading("Uploading & Saving");
    let fileName: string = this.loggedInUser.id + file.name;
    let {task, fileRef} = this.noteService.uploadPDF(file, fileName);
    await task.then().then(
      async res => {
        // metadata
        this.note.metadata = JSON.stringify(res.metadata);

        // Get the url of the PDF file
        this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(async (res) => {
          console.log(res);
          this.note.contentURL = res;
          this.note.timestamp = firebase.firestore.Timestamp.now();
          let id: string;
          await this.noteService.addNote(this.note).then(
            async onfulfilled=>{
              id = onfulfilled.id;
              let subjectName: string = "";
              this.subjectSubscription = this.userService.getSubject(this.note.subject).subscribe(async res => {
                subjectName = res.name;
                let description: string = "";                       
  
                this.loadingService.hideLoading();
                const modal = await this.modalController.create({
                  component: CreateNewsfeedPage,
                  cssClass: 'my-newsfeed-modal-css',
                  componentProps: {
                    description: "Uploaded a note in " + subjectName + "."
                  },
                  backdropDismiss : false,

                });
                modal.onDidDismiss().then(async data => {   
                  this.loadingService.showLoading("Posting");  
                  description = data.data["description"];
                  let news: Newsfeed = {
                    userId: this.loggedInUser.id,
                    description: description,
                    type: "Note",
                    ref_id: id,
                    posted_timestamp: firebase.firestore.Timestamp.now(),
                    timestamp: firebase.firestore.Timestamp.now(),
                    likes: 0,
                    likedUsers: "[]"
                  }
                  await this.newsfeedService.addNewsfeed(news);              
  
                  this.loadingService.hideLoading();
                  this.toastMessageService.showToastMessage("Successfully added the Note", 2000);
                  this.navController.navigateRoot("home/newsfeed");
                })
                await modal.present();
              },
              err=>{
                console.log(err);
                this.loadingService.hideLoading();
                this.toastMessageService.showToastMessage("Failed to add the Newsfeed", 2000);
              });
            },
            onrejected=>{
              console.log(onrejected);
              this.loadingService.hideLoading();
              this.toastMessageService.showToastMessage("Failed to add the Note", 2000);
            }
          );
        }, err => {
          console.log(err);
          this.loadingService.hideLoading();
          this.toastMessageService.showToastMessage("Failed to add the Note", 2000);
        })
      });
  }

  private pickYear(){
    this.note.year = this.note.year.split("-")[0];
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

  private createNullNote(userId: string): Note{
    return {
      name: "",
      year: "",
      subject: "",
      grade_level: "",
      instructor: userId,
      description: "", 
      contentURL: "",
      metadata: "",
      timestamp: firebase.firestore.Timestamp.now()
    }
  }

}

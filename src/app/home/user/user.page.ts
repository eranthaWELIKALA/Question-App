import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/shared/shared.service';
import { User, UserService, Subject } from 'src/app/initial/user.service';
import { NavController } from '@ionic/angular';
import { faBars, faUserCog, faStar } from '@fortawesome/free-solid-svg-icons';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';
import { IconService } from 'src/app/util/icon/icon.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.css'],
})
export class UserPage implements OnInit, OnDestroy {

  @ViewChild('imgFile', {read: false, static: false}) imgFileSelect: ElementRef;

  faBars = faBars;
  faUserCog = faUserCog;
  faStar = faStar;

  private loggedInUser: {id: string, data: User};

  private subjects: {id: string, data: Subject}[];
  private subject: string[];
  private otherSubject: string = "";
  private otherSubjectArray: string[];
  
  private imageFile: File;

  private subjectSubscription: Subscription;
  private fileUploadSubscription: Subscription;

  constructor(
    private navController: NavController,
    private sharedService: SharedService,
    private userService: UserService,
    private loadingService: LoadingService,
    private toastMessageService: ToastMessageService){
      // Get Logged in User's details
      this.loggedInUser = this.sharedService.getLoggedInUser();}

  async ngOnInit() {
    
    await this.loadingService.showLoading("Loading");

    this.subjectSubscription = this.userService.getSubjects().subscribe(async res => {
        this.subjects = res;        
        this.loggedInUser.data.units != null && this.loggedInUser.data.units != undefined ? this.subject = JSON.parse(this.loggedInUser.data.units): "";
        console.log(res);
        this.loadingService.hideLoading();
    },
    err => {
      console.log(err);
      this.loadingService.hideLoading();
    });
  }

  ngOnDestroy(){
    this.subjectSubscription.unsubscribe();
    this.fileUploadSubscription!=undefined?this.fileUploadSubscription.unsubscribe():"";
  }

  private goAdmin(){
    this.navController.navigateForward("/home/user/admin");
  }

  private goAttempt(){
    this.navController.navigateForward("/home/user/attempt");
  }

  private checkFileType(event: FileList){
    if(event.item(0).type != "image/jpg" && event.item(0).type != "image/png" && event.item(0).type != "image/jpeg" && event.item(0).type != "image/gif"){
      this.toastMessageService.showToastMessage("Please select IMG type only", 2000);
      this.imageFile = undefined;
      this.imgFileSelect.nativeElement.value= "";
    }
    else{
      this.imageFile = event.item(0);
    }
  }

  private async uploadFile(file: File){
    console.log("___uploadFile()___");
    this.loadingService.showLoading("Updating");

    // Delete previously uploaded image
    if(this.loggedInUser.data.metadata != ""){
      this.userService.removeImage(JSON.parse(this.loggedInUser.data.metadata));
    }
    let {task, fileRef} = this.userService.uploadImage(file);
    task.then().then(
      res => {
        console.log(res.metadata);
        if(res.metadata == undefined){
          this.loggedInUser.data.metadata = "";
        }
        else{          
          this.loggedInUser.data.metadata = JSON.stringify(res.metadata);
        }
        this.fileUploadSubscription = fileRef.getDownloadURL().subscribe(res => {
          if(res == undefined){
            this.loggedInUser.data.img_url = "";
          }
          this.loggedInUser.data.img_url = res;
          this.saveUser();
          this.loadingService.hideLoading();
        },
        err => {
          console.log(err);
          this.loadingService.hideLoading();
        })
      });
  }

  private async update(form){
    console.log(form);
    await this.loadingService.showLoading("Validating inputs");
    if(!(this.formValidation() && this.emailValidation())){
      console.log("Validation failed");
      this.loadingService.hideLoading();
      return;
    }
    console.log("Validated");
    this.loadingService.hideLoading();
    if(this.imageFile!=undefined){
      await this.uploadFile(this.imageFile); 
    }
    else{
      await this.loadingService.showLoading("Updating");
      this.saveUser();
      this.loadingService.hideLoading();
    }
    
    /*if(this.loggedInUser.data.role == "instructor" && this.otherSubject.replace(/\s/g,"") != ""){

      this.otherSubjectArray = this.otherSubject.split(",");
      let promises = this.otherSubjectArray.map(async element => {
        let subject: Subject = {
          "name": element.replace(/\s/g, "")
        };
        if (subject.name != "") {
          await this.userService.addSubject(subject).then(onfulfilled => {
            console.log(onfulfilled.id);
            this.subject = JSON.parse(JSON.stringify(this.subject)).concat(onfulfilled.id);
            console.log(this.loggedInUser.data.units);
          }, onrejected => {
            console.log(onrejected);
          });
        }
        return new Promise((resolve, reject) => {resolve()});
      });
      Promise.all(promises).then(() => {
        this.loggedInUser.data.units = JSON.stringify(this.subject);
        
        if(this.userService.updateUser(this.loggedInUser.data, this.loggedInUser.id)){
          // Clear the image file
          this.imageFile = undefined;
        } 
      })
    }

    else{
      this.loggedInUser.data.units = JSON.stringify(this.subject);           

      if(this.userService.updateUser(this.loggedInUser.data, this.loggedInUser.id)){
        // Clear the image file
        this.imageFile = undefined;
      } 
    }*/
  }

  private saveUser(){
    this.loggedInUser.data.units = JSON.stringify(this.subject);
    if(this.userService.updateUser(this.loggedInUser.data, this.loggedInUser.id)){
      // Clear the image file
      this.imageFile = undefined;
    }
  }

  private formValidation(): boolean{
    if(this.loggedInUser.data.firstname == "" || this.loggedInUser.data.firstname == null || this.loggedInUser.data.firstname == undefined){
      return false;
    }
    if(this.loggedInUser.data.lastname == "" || this.loggedInUser.data.lastname == null || this.loggedInUser.data.lastname == undefined){
      return false;
    }
    if(this.loggedInUser.data.email == "" || this.loggedInUser.data.email == null || this.loggedInUser.data.email == undefined){
      return false;
    }
    return true;
  }

  private emailValidation(): boolean{
    if(this.loggedInUser.data.email.includes("@") && this.loggedInUser.data.email.includes(".")){
      return true;
    }
    else return false;
  }

}

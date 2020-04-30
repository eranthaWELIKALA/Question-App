import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { faCheck, faGraduationCap, faChalkboardTeacher, faArrowLeft, faUpload, faCamera } from '@fortawesome/free-solid-svg-icons';
import { User, UserService, Subject } from '../user.service';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { SharedService } from 'src/app/shared/shared.service';
import { AgreementModalPage } from './agreement-modal/agreement-modal.page';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
})
export class RegisterPage implements OnInit, OnDestroy {

  @ViewChild('imgFile', {read: false, static: false}) imgFileSelect: ElementRef;

  faGraduationCap = faGraduationCap;
  faCheck = faCheck;
  faChalkboardTeacher = faChalkboardTeacher;
  faArrowLeft = faArrowLeft;
  faUpload = faUpload;
  faCamera = faCamera;

  private signedAgreement: boolean = false;
  private password: string;
  private confirmPassword: string;
  private subject: string[] = []
  private otherSubject: string = "";
  private otherSubjectArray: string[];

  private user: User;
  private subjects: {id: string, data: Subject}[];
  private imageFile: File;

  private contact: string;

  private backButtonRegisterSubscription: Subscription;
  private subjectRegisterSubscription: Subscription;
  private userRegisterSubscription: Subscription;
  private fileUploadRegisterSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private userService: UserService, 
    private sharedService: SharedService,
    private loadingService: LoadingService,
    private toastMessageService: ToastMessageService,
    private navController: NavController,
    private fAuth: AngularFireAuth,
    private platform: Platform,
    private camera: Camera
    ) { }

  async ngOnInit() {
    console.log("___ngOnInit()___");
    this.user = this.createNullUser();
    await this.loadingService.showLoading("Loading");
    this.imageFile = undefined;
    this.subjectRegisterSubscription = this.userService.getSubjects().subscribe(async res => {
      this.subjects = res;
      console.log(res);
      this.loadingService.hideLoading();
    },
    error => {
      console.log(error);
      this.loadingService.hideLoading();
    });

    this.backButtonRegisterSubscription = this.platform.backButton.subscribe(async ()=>{
      this.goBack();
    });
    
  }
  
  ngOnDestroy(){
    console.log("___ngOnDestroy()___");
    this.backButtonRegisterSubscription.unsubscribe();
    this.subjectRegisterSubscription.unsubscribe();
    this.fileUploadRegisterSubscription!=undefined?this.fileUploadRegisterSubscription.unsubscribe():"";
  }

  private goBack(){
    console.log("___goBack()___");

    // Remove if an image is uploaded without creating an account
    if(this.user.img_url != "" && this.user.metadata != ""){
      this.userService.removeImage(JSON.parse(this.user.metadata)).subscribe(()=>{
        console.log("Removed uploaded image");
      });
    }
    this.user = this.createNullUser();
    this.imageFile = undefined;
    this.navController.navigateRoot('/');
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
    this.loadingService.showLoading("Saving");
    if(this.user.img_url != "" && this.user.metadata != ""){
      this.userService.removeImage(JSON.parse(this.user.metadata));
    }
    let {task, fileRef} = this.userService.uploadImage(file);
    task.then().then(
      res => {
        console.log(res.metadata);
        this.user.metadata = JSON.stringify(res.metadata);
        this.fileUploadRegisterSubscription = fileRef.getDownloadURL().subscribe(res => {
          this.user.img_url = res;
          console.log(this.user.img_url);
          this.saveUser();
          this.loadingService.hideLoading();
        },
        err => {
          console.log(err);
          this.loadingService.hideLoading();
        })
      });
    if(this.user.img_url == undefined){
      this.user.img_url = "";
    }
    if(this.user.metadata == undefined){
      this.user.metadata = "";
    }
  }
  
  private async register(form: any){
    console.log("___register()___");
    console.log(JSON.stringify(form.value));
    await this.loadingService.showLoading("Validating inputs");

    // Exit if validation is falied
    let emailValidationVar: boolean = false;
    await this.emailValidation().then(res=>{
      emailValidationVar = res;
      console.log(res)
      console.log(emailValidationVar)
    })
    if(!(this.formValidation() && this.passwordValidation() && emailValidationVar)){
      console.log("Validation failed");
      this.loadingService.hideLoading();
      return;
    }

    // Exit if contact no validation is failed and show a Toast message
    /*if(!this.mobileValidation()){
      console.log("Mobile validation failed");
      this.showToastMessage("Press \"C\" and Validate your contact number");
      return;
    }*/

    console.log("Validated[Form, Password, Email, Mobile]"); 

    if(!this.signedAgreement){
      this.toastMessageService.showToastMessage("Please sign the agreement to continue");
      return;
    }      

    this.loadingService.hideLoading();
    if(this.imageFile!=undefined){
      await this.uploadFile(this.imageFile); 
    }
    else{
      await this.loadingService.showLoading("Saving");
      this.saveUser();
      this.loadingService.hideLoading();
    }
      

  }

  private saveUser(){
    // Add default image urls if user didn't upload a profile picture
    if(this.user.img_url == ""){
      this.user.role=="instructor"?this.user.img_url = this.sharedService.getTeacherPic().url: this.user.img_url = this.sharedService.getStudentPic().url;          
    } 

    this.user.contact = "+94"+this.user.contact;

    // Adding the selected subjects
    this.user.units = this.subject;   

    this.user.create = firebase.firestore.Timestamp.now();

    // Clear the user
    if(this.userService.addUser(this.user)){      
      this.user = this.createNullUser();

      // Clear the image file
      this.imageFile = undefined;

      // Navigating
      this.sharedService.emailVerifyRequestRequest();
      this.navController.navigateRoot("/"); 
    }  
  }

  private formValidation(): boolean{
    console.log("___formValidation()___");
    if(this.user.firstname == "" || this.user.firstname == null || this.user.firstname == undefined){
      return false;
    }
    if(this.user.lastname == "" || this.user.lastname == null || this.user.lastname == undefined){
      return false;
    }
    if(this.user.email == "" || this.user.email == null || this.user.email == undefined){
      return false;
    }
    if(this.user.role == "" || this.user.role == null || this.user.role == undefined){
      return false;
    }
    if(this.password == "" || this.password == null || this.password == undefined){
      return false;
    }
    if(this.user.contact == "" || this.user.contact == null || this.user.contact == undefined){
      return false;
    }
    return true;
  }

  // Not using
  private mobileValidation(): boolean{  
    console.log("___mobileValidation()___");  
    if(this.user.contact != this.contact){
      this.user.contact = "";
      return false;
    }
    return true
  }

  private passwordValidation(): boolean{ 
    if(this.password!= undefined && this.confirmPassword!= undefined){
      if(this.confirmPassword==this.password && this.password!='' && this.password.length >= 8){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }    
  }

  private async emailValidation(): Promise<boolean>{ 
    if(this.user.email.includes("@") && this.user.email.includes(".")){
      let res = false;
      await this.fAuth.auth.createUserWithEmailAndPassword(this.user.email, this.password).then(option=>{
        option.user.sendEmailVerification();
        console.log(JSON.stringify(option));
        console.log("Email is sent");
        res = true;
      }).catch(err=>{
        console.log(err);
        res = false;
      }); 
      return res;
    }
    else return false;
  }

  private emailFormatValidation(): boolean{ 
    if(this.user.email.includes("@") && this.user.email.includes(".")){
      return true;
    }
    else return false;
  }

  private async showAgreement(){
    console.log("___showAgreement()___");
    const modal = await this.modalController.create({
      component: AgreementModalPage,
      cssClass: "my-agreement-modal-css",
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
      console.log(data);
      this.signedAgreement = data.data["signed"];
    })
    return await modal.present();
  }

  private createNullUser(): User{
    console.log("___createNullUser()___");   
    this.password = undefined;
    this.confirmPassword = undefined;
    return {
      adminFeatures: false,
      contact: "",
      create: null,
      email: "",
      firstname: "",
      img_url: "",
      lastname: "",
      role: "",
      verify: "assets/verification/not_verified.png",
      grade_level: "",
      metadata: "",
      units: [],
    };
  }

  private openCamera(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then((imageData) => {
     // imageData is either a base64 encoded string or a file URI
     // If it's base64 (DATA_URL):
     //alert(imageData)
     this.user.img_url=(<any>window).Ionic.WebView.convertFileSrc(imageData);
    }, (err) => {
     // Handle error
     alert("error "+JSON.stringify(err))
    });
  }

}

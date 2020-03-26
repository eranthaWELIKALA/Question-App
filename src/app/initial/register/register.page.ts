import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { faCheck, faGraduationCap, faChalkboardTeacher, faArrowLeft, faUpload, faCamera } from '@fortawesome/free-solid-svg-icons';
import { User, UserService, Subject } from '../user.service';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { SharedService } from 'src/app/shared/shared.service';
import CryptoJS from 'crypto-js';
import { IdeaMartService } from 'src/app/util/ideaMart/idea-mart.service';
import { ValidateMobilePage } from './validate-mobile/validate-mobile.page';
import { isNumber } from 'util';
import { AgreementModalPage } from './agreement-modal/agreement-modal.page';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { Subscription } from 'rxjs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FirebaseApp  } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

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
  private subject: Subject = {
    name: ""
  }
  private otherSubject: string = "";
  private otherSubjectArray: string[];

  private user: User;
  private subjects: {id: string, data: Subject}[];
  private users: {id: string, data: User}[];
  private imageFile: File;

  private mobile: string;

  private backButtonRegisterSubscription: Subscription;
  private subjectRegisterSubscription: Subscription;
  private userRegisterSubscription: Subscription;
  private fileUploadRegisterSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private userService: UserService, 
    private sharedService: SharedService,
    private ideaMartService: IdeaMartService,
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

      // Get Users
      this.userRegisterSubscription = this.userService.getUsers().subscribe(async res => {
        this.users = res;
        console.log(res);
        this.loadingService.hideLoading();
      },
      error => {
        console.log(error);
        this.loadingService.hideLoading();
      });
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
    this.userRegisterSubscription.unsubscribe();
    this.fileUploadRegisterSubscription!=undefined?this.fileUploadRegisterSubscription.unsubscribe():"";
  }

  private goBack(){
    console.log("___goBack()___");

    // Remove if an image is uploaded without creating an account
    if(this.user.img_url != "" && this.user.metadata != ""){
      this.userService.removeImage(this.user.metadata).subscribe(()=>{
        console.log("Removed uploaded image");
      });
    }
    this.user = this.createNullUser();
    this.imageFile = undefined;
    this.navController.navigateRoot('/');
  }

  // Not using
  private async addSubject(){
    console.log("___addSubject()___");
    
    if(this.otherSubject!=""){
      this.userService.addSubject({
        "name": this.otherSubject
      });
      this.otherSubject = "";
      this.toastMessageService.showToastMessage("Subject is added.<br>Select it from the above subjects");
    }    
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
      this.userService.removeImage(this.user.metadata);
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

    // Exit if mobile validation is failed and show a Toast message
    /*if(!this.mobileValidation()){
      console.log("Mobile validation failed");
      this.showToastMessage("Press \"C\" and Validate your mobile number");
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
      this.user.role=="i"?this.user.img_url = this.sharedService.getTeacherPic().url: this.user.img_url = this.sharedService.getStudentPic().url;          
    } 

    this.user.mobile = "+94"+this.user.mobile;

    // Hashing the password
    this.password = JSON.stringify(CryptoJS.SHA1(this.password));

    // Adding the selected subjects
    this.user.units = JSON.stringify(this.subject);       

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
    if(this.user.mobile == "" || this.user.mobile == null || this.user.mobile == undefined){
      return false;
    }
    return true;
  }

  // Not using
  private mobileValidation(): boolean{  
    console.log("___mobileValidation()___");  
    if(this.user.mobile != this.mobile){
      this.user.mobile = "";
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

  // Not using
  private generateOTP(): string{
    console.log("___generateOTP()___"); 
    let min = 10000;
    let max = 100000;
    let otp: number;
    otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString();
  }

  // Not using
  private async validateMobileNumber(){
    console.log("___validateMobileNumber()___"); 
    if(this.mobile != undefined && this.mobile.toString().length == 9 && isNumber(this.mobile)){
      let otp = this.generateOTP();
      let otpId;
      this.ideaMartService.sendSMS({message: otp, telNo: "94"+this.mobile});
      await this.userService.addOTP({otp: otp, status: false}).then(
        onfulfilled =>{
          otpId = onfulfilled.id;
          this.handleModal(otpId);
        },
        onrejected =>{
          console.log(onrejected);
        }
      );
      setTimeout(async x => 
        {
          if(otpId != undefined){
            await this.userService.removeOTP(otpId);          
          }
          this.modalController.getTop().then(onfullfilled =>{   
            if(onfullfilled != undefined) {
              this.modalController.dismiss({"status": false});
            }         
          },
          onrejected =>{
            console.log(onrejected);
          })
        }, 20000);   
    } 
    else{
      this.toastMessageService.showToastMessage("Invalid Phone Number");
    }
  }

  // Not using
  private async handleModal(otpId: string){  
    console.log("___handleModal()___");   
    const modal = await this.modalController.create({
      component: ValidateMobilePage,
      cssClass: "my-validateMobile-modal-css",
      componentProps: {
        "otpId" : otpId 
      },
      backdropDismiss : false
    });
    modal.onDidDismiss().then(data => {
      console.log(data)
      if(data.data["status"]){
        this.user.mobile = this.mobile;
      }
      else{
        this.user.mobile = "";
      }
    })
    return await modal.present();
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
      firstname: "",
      lastname: "",
      email: "",
      mobile: "",
      units: "",
      role: "",
      adminFeatures: false,
      img_url: "",
      metadata: "",
      grade_level: "",
      institute: null,
      instructor: null,
      student: null
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

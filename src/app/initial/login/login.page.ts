import { Component, OnInit, OnDestroy } from '@angular/core';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { UserService, User } from '../user.service';
import { SharedService } from 'src/app/shared/shared.service';
import CryptoJS from 'crypto-js';
import { Platform, AlertController, ModalController, NavController } from '@ionic/angular';
import { IdeaMartService } from 'src/app/util/ideaMart/idea-mart.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Subscription } from 'rxjs';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';
import { IconService } from 'src/app/util/icon/icon.service';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
})
export class LoginPage implements OnInit, OnDestroy {

  faCoffee = faCoffee;
  private email;
  private password;

  
  private loading = false;
  private rememberMe = false;
  private storageLoad = false;
  private passwordType = "password";

  private loginSubscription: Subscription;
  private backButtonSubscription: Subscription;

  constructor(
    private userService: UserService,
    private sharedService: SharedService,
    private toastMessageService: ToastMessageService,
    private alertController: AlertController,
    private nativeStorage: NativeStorage,
    private fAuth: AngularFireAuth,
    private navController: NavController,
    private platform: Platform){
      this.sharedService.setLoggedInUser(undefined);
      if(this.platform.is("cordova")){
        this.nativeStorage.getItem('rememberedUser').then(
          data => {  
            if(data!=undefined){
              this.rememberMe = true;
              this.storageLoad = true;
              this.email = data.email;
              if(data.password!=undefined){   
                this.password = data.password; 
                if(data.loggedIn){
                  this.login();
                }
                else{
                  // nothing to do
                }
              } 
              else{
                // nothing to do
              }
            }
          },
          error => console.error(error)
        );
      }
     }

  async ngOnInit() { 
    console.log("___ngOnInit()___");

    this.backButtonSubscription = this.platform.backButton.subscribe(async ()=>{      
      await this.appExit()
    });
  }

  ngOnDestroy(){    
    console.log("___ngOnDestroy()___");
    this.backButtonSubscription.unsubscribe();
    this.loginSubscription!=undefined?this.loginSubscription.unsubscribe():"";
  }

  private async appExit(){
    let alert = await this.alertController.create({
      header: 'Confirm',
      subHeader: 'Quit?',
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
          handler: () => {
            console.log('Continue');
            this.fAuth.auth.signOut();
            navigator['app'].exitApp();
          }
        }
      ]
    });
    alert.present();
  }

  private login(){
    this.loading = true;
    console.log("___login()___");

    if(this.platform.is("cordova")){
      if(this.rememberMe && !this.storageLoad){
        this.nativeStorage.setItem('rememberedUser', {email: this.email, password: this.password, loggedIn: true})
        .then(() => console.log('Stored item!'),
        error => console.error('Error storing item', error));
      }
      else{
        this.nativeStorage.remove('rememberedUser');
      }
    }
    else{
      // nothing to do
    }

    this.loginSubscription = this.userService.getUsers().subscribe(res =>{
      res = res.filter(x => x.data.email == this.email);
      if(res.length == 0){
        this.loading = false;
        this.toastMessageService.showToastMessage("Invalid Email!!!");     
      }
      else{
        res.forEach(element =>{
          this.fAuth.auth.signInWithEmailAndPassword(element.data.email, this.password).then(onfulfilled=>{
            console.log("SignIn to firebase: " + JSON.stringify(onfulfilled));
            if(onfulfilled.user.emailVerified){
              this.sharedService.setLoggedInUser(element);  
              this.email = undefined;
              this.password = undefined;          
              this.loading = false;
              this.navController.navigateRoot('/home');
            }
            else{
              this.loading = false;
              this.toastMessageService.showToastMessage("Email is not verified!!!");   
              throw "Email is not verified";             
            }
          },
          onrejected=>{
            let tooManyTrialsMsg = "Too many unsuccessful login attempts. Please try again later.";
            console.log(onrejected);
            if(tooManyTrialsMsg == onrejected.message){
              console.log("Too Many Trials");
              this.fAuth.auth.sendPasswordResetEmail(element.data.email).then(onfulfilled=>{
                console.log(onfulfilled);
              },onrejected=>{
                console.log(onrejected);
              })
            }
            else{
              // nothing to do
            }
            this.loading = false;
            this.toastMessageService.showToastMessage("Couldn't Signin to Firebase Acoount!!!");
          });
        })      
      }         
    this.loginSubscription.unsubscribe();     
    this.loginSubscription=undefined;
    },
    err =>{               
      this.loginSubscription.unsubscribe();     
      this.loginSubscription=undefined;
      this.loading = false;
    });
  }

  private showPassword(){
    console.log("___showPassword()___");
    this.passwordType == 'password'? this.passwordType = 'text': this.passwordType = 'password';
  }  
}

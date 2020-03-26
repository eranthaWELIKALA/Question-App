import { Component, OnInit, Input } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ModalController } from '@ionic/angular';
import { UserService, OTP } from '../../user.service';
import { LoadingService } from 'src/app/util/loading/loading.service';
import { Subscription } from 'rxjs';
import { ToastMessageService } from 'src/app/util/toastMessage/toast-message.service';

@Component({
  selector: 'app-validate-mobile',
  templateUrl: './validate-mobile.page.html',
  styleUrls: ['./validate-mobile.page.scss'],
})
export class ValidateMobilePage implements OnInit {

  @Input('otpId') otpId;
  private otp: OTP;
  private otpNumber: string;

  faTimes = faTimes;

  private otpSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private loadingService: LoadingService,
    private toastMessageService: ToastMessageService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadingService.showLoading("Loading");
    this.otpSubscription = this.userService.getOTP(this.otpId).subscribe(async res =>{
      this.otp = res;
      console.log(res);
      this.loadingService.hideLoading();
    },
    err =>{
      console.log(err);
      this.loadingService.hideLoading();
    });
  }

  async ngOnDestroy(): Promise<void> {
    if(this.otpId != undefined){
      await this.userService.removeOTP(this.otpId);
      this.otpId = undefined;
    }
    this.otpSubscription.unsubscribe();
  }

  private async close(){
    await this.userService.removeOTP(this.otpId);
    this.otpId = undefined;
    await this.modalController.dismiss({"status": false});
  }

  private async validate(){
    console.log(this.otpNumber);
    if(this.otpNumber == this.otp.otp){
      await this.userService.removeOTP(this.otpId);
      this.otpId = undefined;

      this.otp = undefined;
      this.otpNumber = undefined;

      await this.modalController.dismiss({"status": true});
    }
    else{
      this.toastMessageService.showToastMessage("OTP number is invalid or expired", 2000);
      this.otpNumber = undefined;
    }
  }

}

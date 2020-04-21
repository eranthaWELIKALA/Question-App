import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PrivacyGuardService } from './privacy-guard.service';
import { HelperModalPage } from 'src/app/helper/helperModal/helper-modal.page';
import { AgreementModalPage } from '../helper/helperModal/agreementModal/agreement-modal/agreement-modal.page';
import { PrivacyModalPage } from '../helper/helperModal/privacyModal/privacy-modal/privacy-modal.page';
import { QuestionPageModule } from './question/question.module';
import { PaperPageModule } from './paper/paper.module';
import { UserPageModule } from './user/user.module';
import { NotePageModule } from './note/note.module';
import { NewsfeedPageModule } from './newsfeed/newsfeed.module';
import { NotificationsPageModule } from './notification/notification.module';
import { AccountSettingsPageModule } from './account-settings/account-settings.module';
import { ImageViewerPage } from '../util/image-viewer/image-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: '',
        redirectTo: 'newsfeed',
        component: HomePage
      },
      { 
        path: 'question', 
        loadChildren: () => QuestionPageModule, 
        canActivate: [PrivacyGuardService]
      },
      { 
        path: 'paper', 
        loadChildren: () => PaperPageModule
      },
      { 
        path: 'user', 
        loadChildren: () => UserPageModule
      },
      { 
        path: 'note', 
        loadChildren: () => NotePageModule
      },
      { 
        path: 'newsfeed', 
        loadChildren: () => NewsfeedPageModule
      },
      { 
        path: 'notification', 
        loadChildren: () => NotificationsPageModule
      },
      { 
        path: 'accountSettings', 
        loadChildren: () => AccountSettingsPageModule
      }
    ]
  }  
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [HelperModalPage, AgreementModalPage, PrivacyModalPage, ImageViewerPage],
  declarations: [HomePage, HelperModalPage, AgreementModalPage, PrivacyModalPage, ImageViewerPage]
})
export class HomePageModule {}

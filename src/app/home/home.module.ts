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
        loadChildren: './question/question.module#QuestionPageModule', 
        canActivate: [PrivacyGuardService]
      },
      { 
        path: 'paper', 
        loadChildren: './paper/paper.module#PaperPageModule'
      },
      { 
        path: 'user', 
        loadChildren: './user/user.module#UserPageModule'
      },
      { 
        path: 'note', 
        loadChildren: './note/note.module#NotePageModule'
      },
      { 
        path: 'newsfeed', 
        loadChildren: './newsfeed/newsfeed.module#NewsfeedPageModule'
      },
      { 
        path: 'notification', 
        loadChildren: './notification/notification.module#NotificationsPageModule'
      },
      { 
        path: 'accountSettings', 
        loadChildren: './account-settings/account-settings.module#AccountSettingsPageModule'
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PrivacyGuardService } from './privacy-guard.service';
import { HelperModalPage } from 'src/app/helper/helperModal/helper-modal.page';

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
        loadChildren: () => import('./question/question.module').then( m => m.QuestionPageModule), 
        canActivate: [PrivacyGuardService]
      },
      { 
        path: 'paper', 
        loadChildren: () => import('./paper/paper.module').then( m => m.PaperPageModule)
      },
      { 
        path: 'user', 
        loadChildren: () => import('./user/user.module').then( m => m.UserPageModule)
      },
      { 
        path: 'note', 
        loadChildren: () => import('./note/note.module').then( m => m.NotePageModule)
      },
      { 
        path: 'newsfeed', 
        loadChildren: () => import('./newsfeed/newsfeed.module').then( m => m.NewsfeedPageModule)
      },
      { 
        path: 'notification', 
        loadChildren: () => import('./notification/notification.module').then( m => m.NotificationsPageModule)
      },
      { 
        path: 'accountSettings', 
        loadChildren: () => import('./account-settings/account-settings.module').then( m => m.AccountSettingsPageModule)
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
  entryComponents: [HelperModalPage],
  declarations: [HomePage, HelperModalPage]
})
export class HomePageModule {}

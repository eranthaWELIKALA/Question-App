import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NotePage } from './note.page';
import { CreateNotePage } from './create-note/create-note.page';
import { ViewCreatedNotePage } from './view-created-note/view-created-note.page';
import { ViewNotePage } from './view-note/view-note.page';
import { PrivacyGuardService } from '../privacy-guard.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CreateNewsfeedPage } from '../newsfeed/create-newsfeed/create-newsfeed.page';
import { CreateNewsfeedPageModule } from '../newsfeed/create-newsfeed/create-newsfeed.module';

const routes: Routes = [
  {
    path: '',
    component: NotePage,
    children: [
      {
        path: '',
        redirectTo: 'create',
      },
      {
        path: 'create',
        component: CreateNotePage,
        canActivate: [PrivacyGuardService]
      },
      {
        path: 'view_create',
        component: ViewCreatedNotePage,
        canActivate: [PrivacyGuardService]
      },
      { path: 'view', 
        component: ViewNotePage
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
    CreateNewsfeedPageModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [CreateNewsfeedPage],
  declarations: [NotePage, CreateNotePage, ViewCreatedNotePage, ViewNotePage]
})
export class NotePageModule {}

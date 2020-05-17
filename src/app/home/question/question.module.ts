import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuestionPage } from './question.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DeleteModalPage } from './delete-question/delete-modal/delete-modal.page';
import { KeyboardPage } from 'src/app/util/keyboard/keyboard.page';
import { QuillModule } from 'ngx-quill';
import { CreateNewsfeedPage } from '../newsfeed/create-newsfeed/create-newsfeed.page';
import { CreateNewsfeedPageModule } from '../newsfeed/create-newsfeed/create-newsfeed.module';

const routes: Routes = [
  {
    path: '',
    component: QuestionPage,
    children: [
      {
        path: '',
        redirectTo: 'add',
        component: QuestionPage
      },
      {
        path: 'add',
        loadChildren: './add-question/add-question.module#AddQuestionPageModule'
      },
      {
        path: 'view',
        loadChildren: './view-question/view-question.module#ViewQuestionPageModule'
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
    QuillModule,    
    CreateNewsfeedPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QuestionPage, DeleteModalPage, KeyboardPage], 
  entryComponents: [DeleteModalPage, KeyboardPage, CreateNewsfeedPage]
})
export class QuestionPageModule {}

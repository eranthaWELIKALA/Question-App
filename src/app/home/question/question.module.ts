import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuestionPage } from './question.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DeleteModalPage } from './delete-question/delete-modal/delete-modal.page';
import { KeyboardPage } from 'src/app/util/keyboard/keyboard.page';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { QuillModule } from 'ngx-quill';
import { CreateNewsfeedPage } from '../newsfeed/create-newsfeed/create-newsfeed.page';
import { CreateNewsfeedPageModule } from '../newsfeed/create-newsfeed/create-newsfeed.module';
import { AddQuestionPageModule } from './add-question/add-question.module';
import { ViewQuestionPageModule } from './view-question/view-question.module';

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
        loadChildren: () => AddQuestionPageModule
      },
      {
        path: 'view',
        loadChildren: () => ViewQuestionPageModule
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
    CKEditorModule,
    QuillModule,    
    CreateNewsfeedPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QuestionPage, DeleteModalPage, KeyboardPage], 
  entryComponents: [DeleteModalPage, KeyboardPage, CreateNewsfeedPage]
})
export class QuestionPageModule {}

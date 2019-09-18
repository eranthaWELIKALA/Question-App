import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
import { AddQuestionPage } from './add-question/add-question.page';
import { ViewQuestionPage } from './view-question/view-question.page';
import { DeleteQuestionPage } from './delete-question/delete-question.page';
import { DeleteModalPage } from './delete-question/delete-modal/delete-modal.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: '',
        redirectTo: 'add',
        component: HomePage
      },
      {
        path: 'add',
        component: AddQuestionPage
      },
      {
        path: 'view',
        component: ViewQuestionPage
      },
      {
        path: 'delete',
        component: DeleteQuestionPage
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
  declarations: [HomePage, AddQuestionPage, ViewQuestionPage, DeleteQuestionPage, DeleteModalPage],
  entryComponents: [DeleteModalPage]
})
export class HomePageModule {}

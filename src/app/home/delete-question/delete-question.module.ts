import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DeleteQuestionPage } from './delete-question.page';
import { DeleteModalPage } from './delete-modal/delete-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DeleteQuestionPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DeleteQuestionPage],
  entryComponents: [DeleteModalPage]
})
export class DeleteQuestionPageModule {}

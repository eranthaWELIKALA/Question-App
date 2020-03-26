import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AnswerPaperModelPage } from './answer-paper-model.page';

const routes: Routes = [
  {
    path: '',
    component: AnswerPaperModelPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AnswerPaperModelPage]
})
export class AnswerPaperModelPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AnswerPaperPage } from './answer-paper.page';

const routes: Routes = [
  {
    path: '',
    component: AnswerPaperPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AnswerPaperPage]
})
export class AnswerPaperPageModule {}

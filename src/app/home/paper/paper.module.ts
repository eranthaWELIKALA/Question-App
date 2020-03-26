import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PaperPage } from './paper.page';
import { CreatePaperPage } from './create-paper/create-paper.page';
import { PrivacyGuardService } from '../privacy-guard.service';
import { ViewPaperPage } from './view-paper/view-paper.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AnswerPaperPage } from './answer-paper/answer-paper.page';
import { AnswerPaperModelPage } from './answer-paper/answer-paper-model/answer-paper-model.page';
import { ViewCreatedNotePage } from '../note/view-created-note/view-created-note.page';
import { ViewCreatedPaperPage } from './view-created-paper/view-created-paper.page';

const routes: Routes = [
  {
    path: '',
    component: PaperPage,
    children: [
      {
        path: '',
        redirectTo: 'create',
      },
      {
        path: 'create',
        component: CreatePaperPage,
        canActivate: [PrivacyGuardService]
      },
      {
        path: 'view_create',
        component: ViewCreatedPaperPage,
        canActivate: [PrivacyGuardService]
      },
      { path: 'view', 
        component: ViewPaperPage
      },
      { path: 'answer', 
        component: AnswerPaperPage
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
  entryComponents: [AnswerPaperModelPage],
  declarations: [PaperPage, CreatePaperPage, ViewCreatedPaperPage, ViewPaperPage, AnswerPaperPage, AnswerPaperModelPage]
})
export class PaperPageModule {}

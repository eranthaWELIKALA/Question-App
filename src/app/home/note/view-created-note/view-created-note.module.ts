import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ViewCreatedNotePage } from './view-created-note.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCreatedNotePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ViewCreatedNotePage]
})
export class ViewCreatedNotePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { KeyboardPage } from './keyboard.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { QuillModule } from 'ngx-quill';

const routes: Routes = [
  {
    path: '',
    component: KeyboardPage
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
    RouterModule.forChild(routes)
  ],
  declarations: [KeyboardPage]
})
export class KeyboardPageModule {}

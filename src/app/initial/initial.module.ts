import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InitialPage } from './initial.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ValidateMobilePage } from './register/validate-mobile/validate-mobile.page';
import { AgreementModalPage } from './register/agreement-modal/agreement-modal.page';

const routes: Routes = [
  {
    path: '',
    component: InitialPage,
    children: [
      {
        path: "",
        redirectTo: "login",
        component: InitialPage,
      },
      {
        path: "login",
        component: LoginPage,
      },
      {
        path: "register",
        component: RegisterPage
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [ValidateMobilePage, AgreementModalPage],
  declarations: [InitialPage, RegisterPage, LoginPage, ValidateMobilePage, AgreementModalPage]
})
export class InitialPageModule {}

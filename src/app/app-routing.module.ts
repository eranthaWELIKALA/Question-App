import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'initial', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  { path: 'initial', loadChildren: () => import('./initial/initial.module').then( m=> m.InitialPageModule) },
  { path: 'delete-modal', loadChildren: './home/delete-question/delete-modal/delete-modal.module#DeleteModalPageModule' },
  { path: 'paper', loadChildren: './home/paper/paper.module#PaperPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

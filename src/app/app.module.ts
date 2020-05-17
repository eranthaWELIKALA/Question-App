import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule} from 'angularfire2/storage';
import { environment } from '../environments/environment';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill'
import { IonicSelectableModule } from 'ionic-selectable';

import { File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { DocumentViewer } from "@ionic-native/document-viewer/ngx";
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AdMobFree } from '@ionic-native/admob-free/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase), IonicSelectableModule, AngularFireAuthModule,
    AngularFirestoreModule, AngularFireStorageModule, HttpClientModule, QuillModule.forRoot() ],
  providers: [
    HttpClient,
    StatusBar, 
    AdMobFree,
    SplashScreen, 
    AndroidPermissions, 
    NativeStorage, 
    File, 
    FileOpener, 
    FileTransfer, 
    DocumentViewer, 
    Network,
    WebView,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

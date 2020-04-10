import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private helperTitles: any[] = [
    {
      "Title": "Newsfeed",
      "type": "newsfeed"
    },
    {
      "Title": "User Profile",
      "type": "profile"
    },
    {
      "Title": "Create Paper",
      "type": "createPaper"
    },
    {
      "Title": "Edit Paper",
      "type": "editPaper"
    },
    {
      "Title": "View Papers",
      "type": "viewPaper"
    },
    {
      "Title": "Add Note",
      "type": "addNote"
    },
    {
      "Title": "View Notes",
      "type": "viewNote"
    }
  ]

  private helperContent: any = 
    {
      "newsfeed": {
        title: "Newsfeed",
        content: [
          "You can change the maximum number of feeds per page",
          "When you like or dislike a feed, page will be refreshed",
          "If you want to jump back to the place where you were you can click \"Jump Button\" in the footer",
          "If the feed is about a paper you can answer the paper from the feed" 
        ]
      },
      "profile": {
        title: "User Profile",
        content: [
          "Please keep the details updated",
          "Make sure all the details are valid, otherwise you might miss some features of the App",
          "Always use a picture of yourself"
        ]
      },
      "createPaper": {
        title: "Create Paper",
        content: [
          "Only for instructors",
          "Please fill all the requiered fields",
          "Don't disgrace yourself by creating unrelevant papers",
          "Using a good standard in papers is a key to success."
        ]
      },
      "editPaper": {
        title: "Edit Paper",
        content: [
          "Only for instructors",
          "Please fill all the requiered fields",
          "Don't disgrace yourself by creating unrelevant papers",
          "Using a good standard in papers is a key to success."
        ]
      },
      "viewPaper": {
        title: "View Papers",
        content: [
          "Please fill all the requiered fields",
          "Don't disgrace yourself by creating unrelevant papers",
          "Using a good standard in papers is a key to success."
        ]
      },
      "addNote": {
        title: "Add Note",
        content: [
          "Only for instructors",
          "Please fill all the requiered fields",
          "Don't disgrace yourself by creating unrelevant papers",
          "Using a good standard in papers is a key to success."
        ]
      },
      "viewNote": {
        title: "View Notes",
        content: [
          "Please fill all the requiered fields",
          "Don't disgrace yourself by creating unrelevant papers",
          "Using a good standard in papers is a key to success."
        ]
      }
    }

  constructor() { }

  public showTitles(){
    return this.helperTitles;
  }

  public showContent(helperTitle: string): any{
      return this.helperContent[helperTitle];
  }

}

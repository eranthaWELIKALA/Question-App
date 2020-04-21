import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, Fixture, TestBed } from '@angular/core/testing';

import { PrivacyModalPage } from './privacy-modal.page';

describe('PrivacyModalPage', () => {
  let component: PrivacyModalPage;
  let fixture: Fixture<PrivacyModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compiles();
  }));

  beforeEach(() => {
    fixture = TestBed.create(PrivacyModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

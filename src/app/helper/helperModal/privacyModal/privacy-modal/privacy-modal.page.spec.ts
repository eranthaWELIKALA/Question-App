import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyModalPage } from './privacy-modal.page';

describe('PrivacyModalPage', () => {
  let component: PrivacyModalPage;
  let fixture: ComponentFixture<PrivacyModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

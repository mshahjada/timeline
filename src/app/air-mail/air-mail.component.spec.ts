import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirMailComponent } from './air-mail.component';

describe('AirMailComponent', () => {
  let component: AirMailComponent;
  let fixture: ComponentFixture<AirMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

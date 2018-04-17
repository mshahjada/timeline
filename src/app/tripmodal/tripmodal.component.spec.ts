import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripmodalComponent } from './tripmodal.component';

describe('TripmodalComponent', () => {
  let component: TripmodalComponent;
  let fixture: ComponentFixture<TripmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

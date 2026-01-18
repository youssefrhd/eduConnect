import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivsuccesComponent } from './activsucces.component';

describe('ActivsuccesComponent', () => {
  let component: ActivsuccesComponent;
  let fixture: ComponentFixture<ActivsuccesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivsuccesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivsuccesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

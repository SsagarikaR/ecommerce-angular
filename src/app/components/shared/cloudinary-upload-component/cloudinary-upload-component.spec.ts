import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudinaryUploadComponent } from './cloudinary-upload-component';

describe('CloudinaryUploadComponent', () => {
  let component: CloudinaryUploadComponent;
  let fixture: ComponentFixture<CloudinaryUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudinaryUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudinaryUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

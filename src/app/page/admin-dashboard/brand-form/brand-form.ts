import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from '../../../services/brand/brand';
import { CloudinaryUploadComponent } from '../../../components/shared/cloudinary-upload-component/cloudinary-upload-component';
import { Toast } from '../../../services/toast/toast';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';
import { CommonModule } from '@angular/common';
import { brand } from '../../../types/type';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    CloudinaryUploadComponent,
    CommonModule,
  ],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm implements OnInit {
  brandForm!: FormGroup;
  brandID!: number;
  isEdit = false;

  private router = inject(Router);
  private brandService = inject(Brand);
  private activatedRoute = inject(ActivatedRoute);
  private toast = inject(Toast);
  private fb = inject(FormBuilder);
  cloudinaryConfig = cloudinaryConfig;

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.brandForm = this.fb.group({
      brandName: ['', [Validators.required, Validators.maxLength(50)]],
      brandThumbnail: ['', [Validators.required]],
    });
    if (id) {
      this.isEdit = true;
      this.brandID = parseInt(id, 10);
      this.loadBrandDetails(this.brandID);
    }
  }
  get f() {
    return this.brandForm.controls;
  }

  loadBrandDetails(id: number) {
    this.brandService.getBrands({ brandID: id }).subscribe({
      next: (result: brand[]) => {
        if (result && result.length > 0) {
          this.brandForm.patchValue({
            brandName: result[0].brandName,
            brandThumbnail: result[0].brandThumbnail,
          });
        } else {
          this.toast.show('Brand not found.', 'error');
          this.router.navigateByUrl('/admin/brands');
        }
      },
    });
  }

  onThumbnailChange(thumbnailUrl: string) {
    this.f['brandThumbnail'].setValue(thumbnailUrl);
    this.f['brandThumbnail'].markAsTouched();
    this.f['brandThumbnail'].markAsDirty();
  }

  saveBrand() {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    const formData = this.brandForm.value;
    if (this.isEdit) {
      this.updateBrand(formData);
    } else {
      this.addBrand(formData);
    }
  }

  addBrand(data: Partial<brand>) {
    this.brandService
      .postBrands({
        brandName: data.brandName,
        brandThumbnail: data.brandThumbnail,
      })
      .subscribe({
        next: () => {
          this.toast.show('Brand added successfully!', 'success');
          this.router.navigateByUrl('/admin/brands');
        },
        error: (error) => {
          console.error('Error creating brand:', error);
          this.toast.show('Error adding brand.', 'error');
        },
      });
  }

  updateBrand(data: Partial<brand>) {
    this.brandService
      .updateBrands({
        brandID: this.brandID,
        brandName: data.brandName,
        brandThumbnail: data.brandThumbnail,
      })
      .subscribe({
        next: () => {
          this.toast.show('Brand updated successfully!', 'success');
          this.router.navigateByUrl('/admin/brands');
        },
        error: (error) => {
          console.error('Error updating brand:', error);
          this.toast.show('Error updating brand.', 'error');
        },
      });
  }

  cancel() {
    this.router.navigateByUrl('/admin/brands');
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from '../../../services/brand/brand';
import { CloudinaryUploadComponent } from '../../../components/shared/cloudinary-upload-component/cloudinary-upload-component';
import { Toast } from '../../../services/toast';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    CloudinaryUploadComponent,
    CommonModule,
  ],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm implements OnInit {
  brandName!: string;
  brandThumbnail!: string;
  brandID!: number;
  isEdit: boolean = false;

  private router = inject(Router);
  private brandService = inject(Brand);
  private activatedRoute = inject(ActivatedRoute);
  private toast = inject(Toast);
  cloudinaryConfig = cloudinaryConfig;

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.brandID = parseInt(id, 10); // Ensure id is a number
      this.loadBrandDetails(this.brandID);
    }
  }

  loadBrandDetails(id: number) {
    this.brandService.getBrands({ brandID: id }).subscribe({
      next: (result: any) => {
        if (result && result.length > 0) {
          this.brandName = result[0].brandName;
          this.brandThumbnail = result[0].brandThumbnail;
        } else {
          this.toast.show('Brand not found.', 'error');
          this.router.navigateByUrl('/admin/brands');
        }
      },
      error: (error) => {
        console.error('Error loading brand:', error);
        this.toast.show('Error loading brand details.', 'error');
        this.router.navigateByUrl('/admin/brands');
      },
    });
  }

  onThumbnailChange(thumbnailUrl: string) {
    this.brandThumbnail = thumbnailUrl;
  }

  saveBrand() {
    if (!this.brandName || !this.brandThumbnail) {
      this.toast.show('Please provide both name and thumbnail.', 'error');
      return;
    }

    if (this.isEdit) {
      this.updateBrand();
    } else {
      this.addBrand();
    }
  }

  addBrand() {
    this.brandService
      .postBrands({
        brandName: this.brandName,
        brandThumbnail: this.brandThumbnail,
      })
      .subscribe({
        next: (response) => {
          console.log('Brand created successfully:', response);
          this.toast.show('Brand added successfully!', 'success');
          this.router.navigateByUrl('/admin/brands');
        },
        error: (error) => {
          console.error('Error creating brand:', error);
          this.toast.show('Error adding brand.', 'error');
        },
      });
  }

  updateBrand() {
    this.brandService
      .updateBrands({
        brandID: this.brandID,
        brandName: this.brandName,
        brandThumbnail: this.brandThumbnail,
      })
      .subscribe({
        next: (response) => {
          console.log('Brand updated successfully:', response);
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

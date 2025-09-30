import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../services/category/category';
import { Toast } from '../../../services/toast/toast';
import { CloudinaryUploadComponent } from '../../../components/shared/cloudinary-upload-component/cloudinary-upload-component';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';
import { category } from '../../../types/type';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-category-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    CloudinaryUploadComponent,
    CommonModule,
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm implements OnInit {
  private toast = inject(Toast);
  categoryID!: number;
  categoryService = inject(Category);
  cloudinaryConfig = cloudinaryConfig;
  router = inject(Router);
  isEdit = false;
  private activatedRoute = inject(ActivatedRoute);

  private fb = inject(FormBuilder);
  categoryForm!: FormGroup;

  ngOnInit() {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.maxLength(50)]],
      categoryThumbnail: ['', [Validators.required]],
    });

    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.categoryID = id;
      this.categoryService
        .getCategories({ categoryID: id })
        .subscribe((result: category[]) => {
          if (result && result.length > 0) {
            this.categoryForm.patchValue({
              categoryName: result[0].categoryName,
              categoryThumbnail: result[0].categoryThumbnail,
            });
          } else {
            this.toast.show('Category not found.', 'error');
            this.router.navigateByUrl('/admin/categories');
          }
        });
    }
  }

  // Convenience getter for easy access to form controls
  get f() {
    return this.categoryForm.controls;
  }

  add() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const formData = this.categoryForm.value;
    this.categoryService
      .postCategories({
        categoryName: formData.categoryName,
        categoryThumbnail: formData.categoryThumbnail,
      })
      .subscribe({
        next: () => {
          this.toast.show('Category Added Successfully!', 'success');
          this.router.navigateByUrl('/admin/categories');
        },
      });
  }

  update() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.toast.show('Please fill out all required fields.', 'error');
      return;
    }
    const formData = this.categoryForm.value;
    this.categoryService
      .updateCategories({
        categoryID: this.categoryID,
        categoryName: formData.categoryName,
        categoryThumbnail: formData.categoryThumbnail,
      })
      .subscribe({
        next: () => {
          this.toast.show('Category Updated Successfully!', 'success');
          this.router.navigateByUrl('/admin/categories');
        },
      });
  }

  cancel() {
    this.router.navigateByUrl('/admin/categories');
  }

  onThumbnailChange(url: string) {
    this.f['categoryThumbnail'].setValue(url);
    this.f['categoryThumbnail'].markAsDirty();
    this.f['categoryThumbnail'].markAsTouched();
  }
}

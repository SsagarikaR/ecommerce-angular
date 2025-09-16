import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Category } from '../../../services/category/category';
import { ActivatedRoute, Router } from '@angular/router';
import { Toast } from '../../../services/toast';
import { CloudinaryUploadComponent } from '../../shared/cloudinary-upload-component/cloudinary-upload-component';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule, MatButtonModule, CloudinaryUploadComponent],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  private toast = inject(Toast);
  name!: string;
  thumbnail!: string;
  categoryID!: number;
  categoryService = inject(Category);
  cloudinaryConfig = cloudinaryConfig;

  router = inject(Router);
  isEdit: boolean = false;

  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.categoryID = id;
      this.categoryService
        .getCategories({ categoryID: id })
        .subscribe((result: any) => {
          console.log('result', result);
          this.name = result[0].categoryName;
          this.thumbnail = result[0].categoryThumbnail;
        });
    }
  }
  add() {
    console.log(this.name, this.thumbnail);

    this.categoryService
      .postCategories({
        categoryName: this.name,
        categoryThumbnail: this.thumbnail,
      })
      .subscribe(
        (response) => {
          console.log('Category created successfully', response);
          this.toast.show('Category Added Successfully!');
          this.router.navigateByUrl('/admin/categories');
        },
        (error) => {
          console.error('Error creating category', error);
        }
      );
  }
  update() {
    this.categoryService
      .updateCategories({
        categoryID: this.categoryID,
        categoryName: this.name,
        categoryThumbnail: this.thumbnail,
      })
      .subscribe((response) => {
        console.log('Categories updated successfully', response);
        this.toast.show('Category Updated Successfully!');
        this.router.navigateByUrl('/admin/categories');
      });
  }
  cancel() {
    this.router.navigateByUrl('/admin/categories');
  }
}

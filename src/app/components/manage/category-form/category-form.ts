import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Category } from '../../../services/category';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  name!: string;
  thumbNail!: string;
  categoryID!: number;
  categoryService = inject(Category);

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
          this.thumbNail = result[0].categoryThumbnail;
        });
    }
  }
  add() {
    console.log(this.name, this.thumbNail);

    this.categoryService
      .postCategories({
        categoryName: this.name,
        categoryThumbnail: this.thumbNail,
      })
      .subscribe(
        (response) => {
          console.log('Category created successfully', response);
          alert('Category Added Successfully!');
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
        categoryThumbnail: this.thumbNail,
      })
      .subscribe((response) => {
        console.log('Categories updated successfully', response);
        alert('Category Updated Successfully!');
        this.router.navigateByUrl('/admin/categories');
      });
  }
}

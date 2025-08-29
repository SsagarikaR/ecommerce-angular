import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { Product } from '../../../services/product/product';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  productName!: string;
  productThumbnail!: string;
  productID!: number;
  productDescription!: string;
  productPrice!: number;
  categoryID!: number;
  stock!: number;
  brandID!: number;
  rating!: number;
  isEdit: boolean = false;
  route = inject(Router);
  productServcie = inject(Product);
  private activatedRoute = inject(ActivatedRoute);
  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.productID = id;
      this.productServcie.get({ id: id }).subscribe((result: any) => {
        this.productName = result[0].productName;
        this.productThumbnail = result[0].productThumbnail;
      });
    }
  }
  add() {
    this.productServcie
      .add({
        productName: this.productName,
        productThumbnail: this.productThumbnail,
        productDescription: this.productDescription,
        productPrice: this.productPrice,
        categoryID: this.categoryID,
        stock: this.stock,
        brandID: this.brandID,
        rating: this.rating,
      })
      .subscribe((response) => {
        console.log('Success Create!', response);
        this.route.navigateByUrl('/admin/brands');
      });
  }
  update() {
    this.productServcie
      .update({
        productID: this.productID,
        productName: this.productName,
        productThumbnail: this.productThumbnail,
      })
      .subscribe((response) => {
        console.log('Success Update!', response);
        this.route.navigateByUrl('/admin/brands');
      });
  }
}

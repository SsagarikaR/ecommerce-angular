import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Product } from '../../../services/product/product';
import { Category } from '../../../services/category/category';
import { Brand } from '../../../services/brand/brand';
import { CloudinaryUploadComponent } from '../../shared/cloudinary-upload-component/cloudinary-upload-component';
import { category, brand } from '../../../types/type';
import { Toast } from '../../../services/toast';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    CloudinaryUploadComponent,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  private toast = inject(Toast);
  private router = inject(Router);
  private productService = inject(Product);
  private categoryService = inject(Category);
  private brandService = inject(Brand);
  private activatedRoute = inject(ActivatedRoute);
  cloudinaryConfig = cloudinaryConfig;

  // Form fields
  productName: string = '';
  productThumbnail: string = '';
  productImage1: string = '';
  productImage2: string = '';
  productImage3: string = '';
  productImage4: string = '';
  productID!: number;
  productDescription: string = '';
  productPrice: number = 0;
  categoryID: number = 0;
  stock: number = 0;
  brandID: number = 0;

  // Dropdown data
  categories: category[] = [];
  brands: brand[] = [];

  // State
  isEdit: boolean = false;
  isLoading: boolean = false;
  isLoadingDropdowns: boolean = false;

  // Cloudinary configuration

  ngOnInit() {
    // Load dropdown data first
    this.loadDropdownData();

    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.productID = id;
      this.loadProductData(id);
    }
  }

  private loadDropdownData() {
    this.isLoadingDropdowns = true;

    // Load categories and brands simultaneously
    Promise.all([
      this.categoryService.getCategories().toPromise(),
      this.brandService.getBrands().toPromise(),
    ])
      .then(([categoriesResponse, brandsResponse]) => {
        this.categories = categoriesResponse as category[];
        this.brands = brandsResponse as brand[];
        this.isLoadingDropdowns = false;
      })
      .catch((error) => {
        console.error('Error loading dropdown data:', error);
        this.toast.show('Error loading categories and brands', 'error');
        this.isLoadingDropdowns = false;
      });
  }

  private loadProductData(id: number) {
    this.isLoading = true;
    this.productService.get({ id: id }).subscribe({
      next: (result: any) => {
        const product = result[0];
        this.productName = product.productName || '';
        this.productThumbnail = product.productThumbnail || '';
        this.productImage1 = product.productImage1 || '';
        this.productImage2 = product.productImage2 || '';
        this.productImage3 = product.productImage3 || '';
        this.productImage4 = product.productImage4 || '';
        this.productDescription = product.productDescription || '';
        this.productPrice = product.productPrice || 0;
        this.categoryID = product.categoryID || 0;
        this.stock = product.stock || 0;
        this.brandID = product.brandID || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.toast.show('Error loading product data', 'error');
        this.isLoading = false;
      },
    });
  }

  isFormValid(): boolean {
    return !!(
      this.productName &&
      this.productThumbnail &&
      this.productImage1 &&
      this.productImage2 &&
      this.productDescription &&
      this.productPrice > 0 &&
      this.categoryID > 0 &&
      this.stock >= 0 &&
      this.brandID > 0
    );
  }

  add() {
    if (!this.isFormValid()) {
      this.toast.show(
        'Please fill in all required fields and upload at least 3 images.',
        'error'
      );
      return;
    }

    this.isLoading = true;
    const productData = {
      productName: this.productName,
      productThumbnail: this.productThumbnail,
      productImage1: this.productImage1,
      productImage2: this.productImage2,
      productImage3: this.productImage3,
      productImage4: this.productImage4,
      productDescription: this.productDescription,
      productPrice: this.productPrice,
      categoryID: this.categoryID,
      stock: this.stock,
      brandID: this.brandID,
    };

    this.productService.add(productData).subscribe({
      next: (response) => {
        this.toast.show('Product created successfully!', 'success');
        this.router.navigateByUrl('/admin/products');
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.toast.show('Error creating product', 'error');
        this.isLoading = false;
      },
    });
  }

  update() {
    if (!this.isFormValid()) {
      this.toast.show(
        'Please fill in all required fields and upload at least 3 images.',
        'error'
      );
      return;
    }

    this.isLoading = true;
    const productData = {
      productID: this.productID,
      productName: this.productName,
      productThumbnail: this.productThumbnail,
      productImage1: this.productImage1,
      productImage2: this.productImage2,
      productImage3: this.productImage3,
      productImage4: this.productImage4,
      productDescription: this.productDescription,
      productPrice: this.productPrice,
      categoryID: this.categoryID,
      stock: this.stock,
      brandID: this.brandID,
    };

    this.productService.update(productData).subscribe({
      next: (response) => {
        this.toast.show('Product updated successfully!', 'success');
        this.router.navigateByUrl('/admin/products');
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.toast.show('Error updating product', 'error');
        this.isLoading = false;
      },
    });
  }

  cancel() {
    this.router.navigateByUrl('/admin/products');
  }
}

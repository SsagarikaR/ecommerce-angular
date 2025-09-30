import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CloudinaryUploadComponent } from '../../../components/shared/cloudinary-upload-component/cloudinary-upload-component';
import { category, brand, product } from '../../../types/type';
import { Toast } from '../../../services/toast/toast';
import { cloudinaryConfig } from '../../../utils/cloudinaryConfig';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
  private fb = inject(FormBuilder);
  cloudinaryConfig = cloudinaryConfig;

  productForm!: FormGroup;
  productID!: number;

  categories: category[] = [];
  brands: brand[] = [];

  isEdit = false;
  isLoading = false;
  isLoadingDropdowns = false;

  ngOnInit() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.maxLength(100)]],
      productPrice: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d*\.?\d*$/),
        ],
      ],
      stock: [
        0,
        [Validators.required, Validators.min(0), Validators.pattern(/^\d*$/)],
      ],
      categoryID: [0, [Validators.required, Validators.min(1)]],
      brandID: [0, [Validators.required, Validators.min(1)]],
      productDescription: [
        '',
        [Validators.required, Validators.maxLength(5000)],
      ],

      productThumbnail: ['', [Validators.required]],
      productImage1: ['', [Validators.required]],
      productImage2: ['', [Validators.required]],
      productImage3: [''],
      productImage4: [''],
    });

    this.loadDropdownData();

    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.productID = id;
      this.loadProductData(id);
    }
  }

  get f(): Record<string, AbstractControl> {
    return this.productForm.controls;
  }

  private loadDropdownData() {
    this.isLoadingDropdowns = true;

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
      next: (result: product[]) => {
        const product = result[0];

        this.productForm.patchValue({
          productName: product.productName,
          productThumbnail: product.productThumbnail,
          productImage1: product.productImage1,
          productImage2: product.productImage2,
          productImage3: product.productImage3,
          productImage4: product.productImage4,
          productDescription: product.productDescription,
          productPrice: product.productPrice,
          categoryID: product.categoryID,
          stock: product.stock,
          brandID: product.brandID,
        });

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onImageChange(controlName: string, url: string) {
    this.f[controlName].setValue(url);
    this.f[controlName].markAsTouched();
    this.f[controlName].markAsDirty();
  }

  add() {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading = true;
    const productData = this.productForm.value;
    this.productService.add(productData).subscribe({
      next: () => {
        this.toast.show('Product created successfully!', 'success');
        this.router.navigateByUrl('/admin/products');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  update() {
    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) {
      this.toast.show(
        'Please correct all form errors before submitting.',
        'error',
      );
      return;
    }

    this.isLoading = true;
    const productData = {
      productID: this.productID,
      ...this.productForm.value,
    };

    this.productService.update(productData).subscribe({
      next: (response: { message: string; success: boolean }) => {
        this.toast.show(
          response.message || 'Product updated successfully!',
          'success',
        );
        this.router.navigateByUrl('/admin/products');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  cancel() {
    this.router.navigateByUrl('/admin/products');
  }
}

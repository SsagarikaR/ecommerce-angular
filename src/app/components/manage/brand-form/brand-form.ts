import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from '../../../services/brand/brand';

@Component({
  selector: 'app-brand-form',
  imports: [FormsModule, MatFormField, MatInput, MatButtonModule, MatLabel],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm {
  brandName!: string;
  brandThumbnail!: string;
  barndID!: number;
  isEdit: boolean = false;
  route = inject(Router);
  brandServcie = inject(Brand);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.barndID = id;
      this.brandServcie.getBrands({ brandID: id }).subscribe((result: any) => {
        this.brandName = result[0].brandName;
        this.brandThumbnail = result[0].brandThumbnail;
      });
    }
  }
  add() {
    this.brandServcie
      .postBrands({
        brandName: this.brandName,
        brandThumbnail: this.brandThumbnail,
      })
      .subscribe((response) => {
        console.log('Success Create!', response);
        this.route.navigateByUrl('/admin/brands');
      });
  }
  update() {
    this.brandServcie
      .updateBrands({
        brandID: this.barndID,
        brandName: this.brandName,
        brandThumbnail: this.brandThumbnail,
      })
      .subscribe((response) => {
        console.log('Success Update!', response);
        this.route.navigateByUrl('/admin/brands');
      });
  }
}

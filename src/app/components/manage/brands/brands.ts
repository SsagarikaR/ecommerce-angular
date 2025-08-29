import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Brand } from '../../../services/brand/brand';

export interface BrandData {
  brandID: string;
  brandName: string;
  BrandThumbnail: string;
}
@Component({
  selector: 'app-brands',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class Brands {
  displayedColumns: string[] = ['brandThumbnail', 'brandName', 'action'];
  brandService = inject(Brand);
  dataSource: MatTableDataSource<BrandData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor() {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource([] as any);
  }
  ngOnInit() {
    this.brandService.getBrands().subscribe((result: any) => {
      console.log(result, 'result');
      this.dataSource = new MatTableDataSource(result);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  delete(brandID: number) {
    this.brandService.deleteBrands(brandID).subscribe((result) => {
      console.log(result, 'Brand Deleted Successfully!');
      this.ngOnInit();
    });
  }
}

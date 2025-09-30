import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { Home } from './home';
import { Product } from '../../services/product/product';
import { Category } from '../../services/category/category';
import { Preferences } from '../../services/preference/preferences';
import { of } from 'rxjs';
import { product, category, preferences } from '../../types/type';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockProductService: jasmine.SpyObj<Product>;
  let mockCategoryService: jasmine.SpyObj<Category>;
  let mockPreferenceService: jasmine.SpyObj<Preferences>;

  const mockCategories: category[] = [
    {
      categoryID: 1,
      categoryName: 'Pottery',
      categoryThumbnail: 'pottery.jpg',
    },
    { categoryID: 2, categoryName: 'Vases', categoryThumbnail: 'vases.jpg' },
  ];
  const mockProducts: product[] = [
    {
      productID: 1,
      productName: 'Mug',
      productThumbnail: 'mug.jpg',
      productDescription: '',
      productPrice: 10,
      categoryID: 1,
      stock: 50,
      brandID: 1,
      brandName: '',
      totalCount: 1,
      rating: 4,
      categoryName: '',
      wishlist: '',
      productImage1: '',
      productImage2: '',
    },
    {
      productID: 2,
      productName: 'Plate',
      productThumbnail: 'plate.jpg',
      productDescription: '',
      productPrice: 15,
      categoryID: 1,
      stock: 30,
      brandID: 1,
      brandName: '',
      totalCount: 1,
      rating: 5,
      categoryName: '',
      wishlist: '',
      productImage1: '',
      productImage2: '',
    },
  ];
  const mockPreferences: preferences[] = [
    {
      userID: 1,
      productID: 3,
      productName: 'Bowl',
      productThumbnail: 'bowl.jpg',
      productDescription: '',
      productPrice: 20,
      categoryID: 2,
      stock: 25,
      brandID: 2,
      brandName: '',
      totalCount: 1,
      rating: 4.5,
      categoryName: '',
      wishlist: '',
      productImage1: '',
      productImage2: '',
    },
  ];

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('Product', ['get']);
    mockCategoryService = jasmine.createSpyObj('Category', ['getCategories']);
    mockPreferenceService = jasmine.createSpyObj('Preferences', [
      'getPrefernces',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        Home,
        CarouselModule,
        RouterLink,
        CommonModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Product, useValue: mockProductService },
        { provide: Category, useValue: mockCategoryService },
        { provide: Preferences, useValue: mockPreferenceService },
        provideRouter([]),
        provideAnimationsAsync(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    mockProductService.get.and.returnValue(of(mockProducts));
    mockCategoryService.getCategories.and.returnValue(of(mockCategories));
    mockPreferenceService.getPrefernces.and.returnValue(of(mockPreferences));

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call product, category, and preference services on init', () => {
    expect(mockProductService.get).toHaveBeenCalled();
    expect(mockCategoryService.getCategories).toHaveBeenCalled();
    expect(mockPreferenceService.getPrefernces).toHaveBeenCalled();
  });

  it('should assign fetched data to component properties', fakeAsync(() => {
    expect(component.products).toEqual(mockProducts);
    expect(component.categories).toEqual(mockCategories);
    expect(component.preferences).toEqual(mockPreferences);
  }));

  it('should display the hero image from a fetched category', () => {
    const heroImage = fixture.nativeElement.querySelector('.hero-img');
    expect(heroImage.src).toContain('pottery.jpg');
  });

  it('should display the about us image from a fetched category', () => {
    const aboutImage = fixture.nativeElement.querySelector(
      '[alt="Studio workspace with handcrafted ceramics"]',
    );
    expect(aboutImage.src).toContain('vases.jpg');
  });

  it('should render the correct number of product cards', () => {
    const productCards =
      fixture.nativeElement.querySelectorAll('app-product-card');
    expect(productCards.length).toBe(mockProducts.length);
  });

  it('should render the "Recommended for you" section if preferences exist', () => {
    const recommendedSection =
      fixture.nativeElement.querySelector('section:last-child');
    expect(recommendedSection).toBeTruthy();
  });

  it('should hide the "Recommended for you" section if no preferences exist', () => {
    mockPreferenceService.getPrefernces.and.returnValue(of([]));

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const recommendedSection = fixture.nativeElement.querySelector(
      'section[ngIf="preferences && preferences.length > 1"]',
    );
    expect(recommendedSection).toBeFalsy();
  });
});

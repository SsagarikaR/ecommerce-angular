import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCard } from './product-card';
import { Wishlist } from '../../services/wishlist/wishlist';
import { of, throwError } from 'rxjs';
import { provideRouter, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddToCartButton } from '../add-to-cart-button/add-to-cart-button';
import { WishList } from '../shared/wish-list/wish-list';
import { By } from '@angular/platform-browser';
import { product } from '../../types/type';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let mockWishlistService: jasmine.SpyObj<Wishlist>;
  let mockProduct: product;

  beforeEach(async () => {
    mockWishlistService = jasmine.createSpyObj('Wishlist', [
      'addToWishlist',
      'deleteFromWishlist',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterLink,
        AddToCartButton,
        WishList,
        ProductCard,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Wishlist, useValue: mockWishlistService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;

    mockProduct = {
      productID: 1,
      productName: 'Test Product',
      productThumbnail: 'test-image.png',
      productDescription: 'This is a short description for the test product.',
      productPrice: 99,
      categoryID: 101,
      stock: 50,
      brandID: 201,
      brandName: 'Test Brand',
      totalCount: 1,
      rating: 4.5,
      categoryName: 'Electronics',
      wishlist: 'no',
      productImage1: 'img1.jpg',
      productImage2: 'img2.jpg',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the full description when "Read more" is clicked', () => {
    const longDescriptionProduct = {
      ...mockProduct,
      productDescription:
        'A very long product description that is well over sixty characters long to trigger the "Read more" functionality on the component',
    };
    component.item = longDescriptionProduct;
    fixture.detectChanges();

    const descriptionElement = fixture.debugElement.query(
      By.css('p.mt-1.text-sm')
    );
    expect(descriptionElement.nativeElement.textContent).toContain('...');
    expect(component.isExpanded).toBeFalse();

    // Trigger the method directly
    component.toggleDescription();
    fixture.detectChanges();

    // After click, the full description should be visible and isExpanded should be true
    expect(component.isExpanded).toBeTrue();
    expect(descriptionElement.nativeElement.textContent).toContain(
      longDescriptionProduct.productDescription
    );
    expect(descriptionElement.nativeElement.textContent).not.toContain('...');
  });

  it('should toggle back to truncated description when "Read less" is clicked', () => {
    const longDescriptionProduct = {
      ...mockProduct,
      productDescription:
        'A very long product description that is well over sixty characters long to trigger the "Read more" functionality on the component',
    };
    component.item = longDescriptionProduct;
    fixture.detectChanges();

    // First, expand the description
    component.toggleDescription();
    fixture.detectChanges();

    // The button text should now be "Read less"
    const readMoreButton = fixture.debugElement.query(
      By.css('button.ml-1')
    ).nativeElement;
    expect(readMoreButton.textContent.trim()).toBe('Read less');

    // Trigger the method again
    component.toggleDescription();
    fixture.detectChanges();

    // The description should be truncated again
    expect(component.isExpanded).toBeFalse();
    expect(
      fixture.debugElement.query(By.css('p.mt-1.text-sm')).nativeElement
        .textContent
    ).toContain('...');
  });

  it('should not show the "Read more" button for short descriptions', () => {
    component.item = mockProduct;
    fixture.detectChanges();

    const readMoreButton = fixture.debugElement.query(By.css('button.ml-1'));
    expect(readMoreButton).toBeNull();
  });

  it('should call addToWishlist and update item properties when the wishlist toggle is clicked and the item is not wishlisted', () => {
    component.item = mockProduct;
    fixture.detectChanges();
    const newWishlistID = 5;

    mockWishlistService.addToWishlist.and.returnValue(
      of({ wishlistID: newWishlistID })
    );

    // Simulate clicking the wishlist button
    component.toggleWishlist({
      wishlistID: undefined,
      productID: mockProduct.productID,
    });

    expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith({
      productID: mockProduct.productID,
    });
    expect(component.item.wishlist).toBe('yes');
    expect(component.item.wishListID).toBe(newWishlistID);
  });

  it('should log an error to the console if addToWishlist fails', () => {
    component.item = mockProduct;
    fixture.detectChanges();
    const consoleSpy = spyOn(console, 'error');

    mockWishlistService.addToWishlist.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.toggleWishlist({
      wishlistID: undefined,
      productID: mockProduct.productID,
    });

    expect(consoleSpy).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it('should log an error to the console if deleteFromWishlist fails', () => {
    const wishlistedProduct = {
      ...mockProduct,
      wishlist: 'yes',
      wishListID: 5,
    };
    component.item = wishlistedProduct;
    fixture.detectChanges();
    const consoleSpy = spyOn(console, 'error');

    mockWishlistService.deleteFromWishlist.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.toggleWishlist({
      wishlistID: wishlistedProduct.wishListID,
      productID: undefined,
    });

    expect(consoleSpy).toHaveBeenCalledWith(jasmine.any(Error));
  });
});

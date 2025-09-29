import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WishList } from './wish-list-icon';

describe('WishList', () => {
  let component: WishList;
  let fixture: ComponentFixture<WishList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishList],
    }).compileComponents();

    fixture = TestBed.createComponent(WishList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the default state when not wishlisted', () => {

    component.isWishlisted = false;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    const svg = fixture.debugElement.query(By.css('svg'));


    expect(button.nativeElement.title).toBe('Add to Wishlist');
    expect(svg.classes['text-red-500']).toBeFalsy();
    expect(svg.classes['fill-red-500']).toBeFalsy();
    expect(svg.classes['text-gray-400']).toBe(true);
  });

  it('should display the wishlisted state when wishlisted', () => {

    component.isWishlisted = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    const svg = fixture.debugElement.query(By.css('svg'));


    expect(button.nativeElement.title).toBe('Remove from Wishlist');
    expect(svg.classes['text-red-500']).toBe(true);
    expect(svg.classes['fill-red-500']).toBe(true);
    expect(svg.classes['text-gray-400']).toBeFalsy();
  });

  it('should emit the correct data on click', () => {

    component.productID = 123;
    component.wishlistID = 456;
    spyOn(component.toggle, 'emit');


    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();


    expect(component.toggle.emit).toHaveBeenCalledWith({
      wishlistID: 456,
      productID: 123,
    });
  });

  it('should stop event propagation when clicked', () => {

    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');


    component.onToggle(event);


    expect(event.stopPropagation).toHaveBeenCalled();
  });
});

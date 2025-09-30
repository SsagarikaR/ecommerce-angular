import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ProductForm } from './product-form';
import { FormsModule } from '@angular/forms';

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductForm,
        FormsModule,
      ],

    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});

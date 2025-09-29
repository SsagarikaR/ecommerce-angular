import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wish-list',
  imports: [CommonModule],
  templateUrl: './wish-list.html',
  styleUrl: './wish-list.css',
})
export class WishList {
  @Input() isWishlisted = false;
  @Input() wishlistID: number | undefined;
  @Input() productID: number | undefined;
  @Output() toggle = new EventEmitter<{
    wishlistID: number | undefined;
    productID: number | undefined;
  }>();

  onToggle(event: Event) {
    event.stopPropagation();
    this.toggle.emit({
      wishlistID: this.wishlistID,
      productID: this.productID,
    });
  }
}

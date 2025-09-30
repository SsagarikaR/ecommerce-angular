import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-wish-list',
  imports: [CommonModule],
  templateUrl: './wish-list-icon.html',
  styleUrl: './wish-list-icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishList {
  @Input() isWishlisted = false;
  @Input() wishlistID: number | undefined;
  @Input() productID: number | undefined;
  @Output() wishlistToggle = new EventEmitter<{
    wishlistID: number | undefined;
    productID: number | undefined;
  }>();

  onToggle(event: Event) {
    event.stopPropagation();
    this.wishlistToggle.emit({
      wishlistID: this.wishlistID,
      productID: this.productID,
    });
  }
}

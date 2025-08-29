import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class Dialog {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() visible = false;

  @Output() confirmed = new EventEmitter<boolean>();

  confirm(choice: boolean) {
    this.confirmed.emit(choice);
  }
}

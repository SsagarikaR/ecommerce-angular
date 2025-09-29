import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService, DialogData } from '../../../services/dialog/dialog';

@Component({
  selector: 'app-dialog',
  imports: [CommonModule],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.css'],
})
export class Dialog implements OnInit, OnDestroy {
  private dialogService = inject(DialogService);
  private subscription!: Subscription;

  title: string = 'Confirm';
  message: string = 'Are you sure?';
  visible: boolean = false;

  ngOnInit() {
    this.subscription = this.dialogService.dialogData$.subscribe(
      (data: DialogData) => {
        this.title = data.title;
        this.message = data.message;
        this.visible = true;
      }
    );
  }

  confirm(choice: boolean) {
    this.dialogService.confirm(choice);
    this.visible = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

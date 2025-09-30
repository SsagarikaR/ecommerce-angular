import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DialogData {
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private dialogSubject = new Subject<boolean>();
  private dialogDataSubject = new Subject<DialogData>();

  confirmed$ = this.dialogSubject.asObservable();

  dialogData$ = this.dialogDataSubject.asObservable();

  open(data: DialogData) {
    this.dialogDataSubject.next(data);
  }

  confirm(choice: boolean) {
    this.dialogSubject.next(choice);
  }
}

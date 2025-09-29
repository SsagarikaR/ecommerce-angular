import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Toast {
  private toastState = new BehaviorSubject<{
    message?: string;
    type?: string;
    visible: boolean;
  }>({ visible: false });
  toastState$ = this.toastState.asObservable();
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastState.next({ message, type, visible: true });
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    this.toastState.next({ visible: false });
  }
}

import { Component, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Header } from './components/layouts/header/header';
import { Footer } from './components/layouts/footer/footer';
import { Toast } from './services/toast';
import { Toast as toast } from './components/shared/toast/toast';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CartModal } from './components/cart-modal/cart-modal';
import { Dialog } from './components/shared/dialog/dialog';
import { Auth } from './services/auth/auth';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    toast,
    CommonModule,
    CartModal,
    Dialog,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private authService = inject(Auth);
  protected readonly title = signal('angular_auth');
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } = {
    message: '',
    type: 'info',
    visible: false,
  };
  showLayout = true;
  constructor(
    private toastService: Toast,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const child = this.activatedRoute.firstChild;
        this.showLayout = !child?.snapshot.data['hideLayout'];
      });
  }
  ngOnInit() {
    this.toastService.toastState$.subscribe((state: any) => {
      this.toast = state;
    });
    this.authService.fetchUserProfile();
  }
}

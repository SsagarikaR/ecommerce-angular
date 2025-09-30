import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Header } from './components/layouts/header/header';
import { Footer } from './components/layouts/footer/footer';
import { Toast } from './services/toast/toast';
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
export class App implements OnInit {
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
  private toastService = inject(Toast);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  constructor() {
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

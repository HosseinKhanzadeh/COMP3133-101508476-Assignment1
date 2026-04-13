import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-shell',
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="ems-app-main">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MainShellComponent {}

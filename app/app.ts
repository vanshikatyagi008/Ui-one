import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { Home } from './pages/home/home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule,  Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('WishCart_UI');
}

import {Component, signal} from '@angular/core';
import {CsvGridComponent} from './csv-grid/csv-grid.component';

@Component({
  selector: 'app-root',
  imports: [CsvGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Table');
}

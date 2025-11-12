import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AgGridAngular} from 'ag-grid-angular';

@Component({
  selector: 'app-csv-grid',
  templateUrl: './csv-grid.component.html',
  imports: [
    AgGridAngular
  ],
  styleUrls: ['./csv-grid.component.scss']
})
export class CsvGridComponent implements OnInit {
  public columnDefs: any[] = [];
  public rowData: any[] = [];
  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCsvFromAssets();
    (window as any).grid = this;
  }

  loadCsvFromAssets(): void {
    this.http.get('merged.csv', { responseType: 'text' })
      .subscribe(csv => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',');

        this.rowData = lines.map(line => {
          const values = line.split(',');
          return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
        });

        this.columnDefs = headers.map(h => ({ headerName: h, field: h }));

        console.log('rowData:', this.rowData);
        console.log('columnDefs:', this.columnDefs);
      });

  }
}

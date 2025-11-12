import {Component, OnInit, viewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, ICellRendererParams} from 'ag-grid-community';
import {Game} from './game';

export function LinkRenderer(params: ICellRendererParams) {
  return `<a href="${params.value}" target="_blank">Link</a>`;
}

@Component({
  selector: 'app-csv-grid',
  templateUrl: './csv-grid.component.html',
  imports: [
    AgGridAngular
  ],
  styleUrls: ['./csv-grid.component.scss']
})
export class CsvGridComponent implements OnInit {
  public columnDefs: ColDef<Game>[] = [
    {headerName: "id", field: "id"},
    {headerName: "name", field: "name"},
    {headerName: "rank", field: "rank"},
    {headerName: "rating", field: "average"},
    {headerName: "complexity", field: "complexity"},
    {headerName: "size (WxLxD in)", valueGetter: i => `${Number(i.data?.width).toFixed(2)}x${Number(i.data?.length)?.toFixed(2)}x${Number(i.data?.depth)?.toFixed(2)}`},
    {headerName: "weight (lbs)", valueGetter: i => `${Number(i.data?.weight).toFixed(2)}`},
    {headerName: "bgg", valueGetter: i => `https://boardgamegeek.com/boardgame/${i.data?.id}`, cellRenderer: LinkRenderer}
  ];
  public rowData: any[] = [];
  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true
  };

  grid = viewChild(AgGridAngular);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCsvFromAssets();
    (window as any).grid = this;
  }

  loadCsvFromAssets(): void {
    this.http.get('merged.csv', { responseType: 'text' })
      .subscribe(csv => {
        const [headerLine, ...lines] = csv.trim().split('\n');
        const headers = headerLine.split(',').map(v => v.replace("\r", ""));

        this.rowData = lines.map(line => {
          const values = line.split(',').map(v => v.replace("\r", ""));
          return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
        });
        // fit columns to screen
        this.grid()?.api.sizeColumnsToFit();

        console.log('rowData:', this.rowData);
      });

  }
}

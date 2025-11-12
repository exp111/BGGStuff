import {Component, OnInit, viewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AgGridAngular} from 'ag-grid-angular';
import {ColDef, ICellRendererParams, ValueFormatterParams, ValueGetterParams} from 'ag-grid-community';
import {Game} from './game';
import Papa from 'papaparse';

export function LinkRenderer(params: ICellRendererParams) {
  return `<a href="${params.value}" target="_blank">Link</a>`;
}

let floatFormatter = (p: ValueFormatterParams<Game>) => Number(p.value).toFixed(2);

let getVolume = (i: ValueGetterParams<Game>) => Number(i.data?.weight) * Number(i.data?.depth) * Number(i.data?.length);


@Component({
  selector: 'app-csv-grid',
  templateUrl: './csv-grid.component.html',
  imports: [
    AgGridAngular
  ],
  styleUrls: ['./csv-grid.component.scss']
})
export class CsvGridComponent implements OnInit {
  getWeightScore = (i: ValueGetterParams<Game>) => Number(i.data?.weight) / this.maxWeight;
  public columnDefs: ColDef<Game>[] = [
    {headerName: "id", field: "id"},
    {headerName: "name", field: "name"},
    {headerName: "rank", field: "rank"},
    {headerName: "rating", field: "average", valueFormatter: floatFormatter},
    {headerName: "complexity", field: "complexity", valueFormatter: floatFormatter},
    {
      headerName: "size (WxLxD in)",
      valueGetter: i => `${Number(i.data?.width).toFixed(2)}x${Number(i.data?.length)?.toFixed(2)}x${Number(i.data?.depth)?.toFixed(2)}`
    },
    {headerName: "weight (lbs)", field: "weight", valueFormatter: floatFormatter},
    {
      headerName: "bgg",
      valueGetter: i => `https://boardgamegeek.com/boardgame/${i.data?.id}`,
      cellRenderer: LinkRenderer
    },
    {
      headerName: "volume",
      valueGetter: getVolume,
      valueFormatter: floatFormatter
    },
    {
      headerName: "weightPerInch",
      valueGetter: i => getVolume(i) / Number(i.data?.weight),
      valueFormatter: floatFormatter
    },
    {
      headerName: "weightPerComplexity",
      valueGetter: i => Number(i.data?.complexity) / Number(i.data?.weight),
      valueFormatter: floatFormatter
    },
    {
      headerName: "weightScore",
      valueGetter: i => this.getWeightScore(i) * 5,
      valueFormatter: floatFormatter
    },
    {
      headerName: "weightScorePerComplexity",
      valueGetter: i => Number(i.data?.complexity) / this.getWeightScore(i),
      valueFormatter: floatFormatter
    },
    {
      headerName: "weightScorePerRating",
      valueGetter: i => Number(i.data?.average) / this.getWeightScore(i),
      valueFormatter: floatFormatter
    }
  ];
  public rowData: any[] = [];
  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true
  };
  maxWeight = 1;

  grid = viewChild(AgGridAngular);

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.loadCsvFromAssets();
    (window as any).grid = this;
  }

  loadCsvFromAssets(): void {
    this.http.get('merged.csv', {responseType: 'text'})
      .subscribe(csv => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // transforms numbers
          quoteChar: '"',
        });

        this.rowData = parsed.data;
        this.maxWeight = Math.max(...this.rowData.map(r => Number(r.weight) || 0));

        console.log('rowData:', this.rowData);
      });

  }
}

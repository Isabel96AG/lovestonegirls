import { ChangeDetectorRef, Component, OnInit, AfterViewInit } from '@angular/core';
import { EstadisticsService } from '../../modules/estadistics/estadistics.service';
import Chart from 'chart.js/auto';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {

  kpis: any = { hoy: 0, este_mes: 0, este_anio: 0, total_clientes: 0 };
  productosMasVendidos: any[] = [];
  clientes: any[] = [];
  ventasPorMes: any[] = [];
  cargando: boolean = true;
  grafico: Chart | null = null;

  constructor(
    private estadisticsService: EstadisticsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.estadisticsService.getEstadistics().subscribe({
      next: (resp: any) => {
        this.kpis = resp.kpis;
        this.productosMasVendidos = resp.productos_mas_vendidos;
        this.clientes = resp.clientes;
        this.ventasPorMes = resp.ventas_por_mes;
        this.cargando = false;
        this.cdr.detectChanges();
        setTimeout(() => this.construirGrafico(), 100);
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {}

  construirGrafico() {
    const canvas = document.getElementById('graficoVentas') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.grafico) this.grafico.destroy();

    const etiquetas = this.ventasPorMes.map(v => MESES[v.mes - 1] + ' ' + v.anio);
    const valores = this.ventasPorMes.map(v => parseFloat(v.total));

    this.grafico = new Chart(canvas, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Ventas (€)',
          data: valores,
          borderColor: '#821f40',
          backgroundColor: 'rgba(130, 31, 64, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#821f40',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value + '€'
            }
          }
        }
      }
    });
  }
}

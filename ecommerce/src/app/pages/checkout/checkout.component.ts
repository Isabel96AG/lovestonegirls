import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart.service';
import { SaleService } from '../../services/sale.service';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

// clave publicable de Stripe — esta sí puede estar en el frontend
const STRIPE_PUBLIC_KEY = 'pk_test_51TVYzsEPvGrMiyxDxs0JgZf4X5KBUPIBcGQtvsc0tNDXTNFx4QyBELU3OSx4Sk2siKv32GJHPPoa21rOS7uuu2HS00WGlsIpVV';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, AfterViewInit {

  // items del carrito que se van a comprar
  items: any[] = [];
  cargando: boolean = true;
  procesando: boolean = false;

  // método de pago seleccionado
  metodoPago: string = 'tarjeta';

  // datos del formulario de envío
  nombre: string = '';
  apellidos: string = '';
  telefono: string = '';
  direccion: string = '';
  ciudad: string = '';
  provincia: string = '';
  codigoPostal: string = '';
  pais: string = 'España';
  notas: string = '';

  // errores de validación del formulario
  errores: any = {};

  // objetos de Stripe que usaremos para procesar el pago
  stripe: Stripe | null = null;
  cardElement: StripeCardElement | null = null;

  // indica si el campo de tarjeta ya está listo para usarse
  cardLista: boolean = false;

  constructor(
    private cartService: CartService,
    private saleService: SaleService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    // cargamos los productos del carrito al entrar en checkout
    this.cartService.getCarts().subscribe({
      next: (resp: any) => {
        this.items = resp.carts;
        this.cargando = false;
        // si el carrito está vacío no tiene sentido estar aquí
        if (this.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.cargando = false;
        this.router.navigate(['/cart']);
      }
    });
  }

  async ngAfterViewInit() {
    // cargamos Stripe con nuestra clave publicable
    this.stripe = await loadStripe(STRIPE_PUBLIC_KEY);
    if (!this.stripe) return;

    // creamos los Elements de Stripe — son los campos de tarjeta seguros
    const elements = this.stripe.elements();

    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#333',
          '::placeholder': { color: '#aaa' }
        }
      },
      hidePostalCode: true
    });

    // pequeño delay para asegurarnos de que Angular ha terminado de renderizar el div
    setTimeout(() => {
      this.cardElement!.mount('#card-element');

      // esperamos al evento ready — hasta que no se emita no usamos el campo
      this.cardElement!.on('ready', () => {
        this.cardLista = true;
      });
    }, 100);
  }

  // calculamos el total sumando todos los items
  get total(): number {
    return this.items.reduce((acc, i) => acc + parseFloat(i.total), 0);
  }

  // validación antes de enviar el pedido
  validarFormulario(): boolean {
    this.errores = {};

    // nombre y apellidos — mínimo 2 caracteres
    if (!this.nombre.trim()) {
      this.errores.nombre = 'El nombre es obligatorio';
    } else if (this.nombre.trim().length < 2) {
      this.errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!this.apellidos.trim()) {
      this.errores.apellidos = 'Los apellidos son obligatorios';
    } else if (this.apellidos.trim().length < 2) {
      this.errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    // teléfono — exactamente 9 dígitos numéricos
    if (!this.telefono.trim()) {
      this.errores.telefono = 'El teléfono es obligatorio';
    } else {
      const phoneRegex = /^\d{9}$/;
      if (!phoneRegex.test(this.telefono.replace(/\s/g, ''))) {
        this.errores.telefono = 'El teléfono debe tener exactamente 9 dígitos';
      }
    }

    // dirección — no puede estar vacía
    if (!this.direccion.trim()) {
      this.errores.direccion = 'La dirección es obligatoria';
    }

    // ciudad — no puede estar vacía
    if (!this.ciudad.trim()) {
      this.errores.ciudad = 'La ciudad es obligatoria';
    }

    // código postal — exactamente 5 dígitos (formato español)
    if (!this.codigoPostal.trim()) {
      this.errores.codigoPostal = 'El código postal es obligatorio';
    } else {
      const cpRegex = /^\d{5}$/;
      if (!cpRegex.test(this.codigoPostal.trim())) {
        this.errores.codigoPostal = 'El código postal debe tener 5 dígitos';
      }
    }

    // si no hay errores el formulario es válido
    return Object.keys(this.errores).length === 0;
  }

  // enviar el pedido al backend
  async confirmarPedido() {
    if (!this.validarFormulario()) {
      this.toastr.warning('Revisa los campos obligatorios', 'Formulario incompleto');
      return;
    }

    this.procesando = true;

    const datos: any = {
      method_payment: this.metodoPago,
      name:           this.nombre,
      surname:        this.apellidos,
      phone:          this.telefono,
      address:        this.direccion,
      city:           this.ciudad,
      province:       this.provincia,
      postal_code:    this.codigoPostal,
      country:        this.pais,
      notes:          this.notas,
    };

    // si el método es tarjeta pedimos a Stripe el payment_method_id
    if (this.metodoPago === 'tarjeta') {
      if (!this.stripe || !this.cardElement || !this.cardLista) {
        this.toastr.error('El campo de tarjeta aún no está listo, espera un momento', 'Error');
        this.procesando = false;
        return;
      }

      // Stripe recoge los datos de la tarjeta y nos devuelve un id seguro
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
      });

      if (error) {
        // mostramos el mensaje de error de Stripe (tarjeta inválida, etc.)
        this.toastr.error(error.message, 'Error de pago');
        this.procesando = false;
        return;
      }

      // añadimos el id del método de pago para enviarlo a Laravel
      datos.payment_method_id = paymentMethod.id;
    }

    this.saleService.createSale(datos).subscribe({
      next: (resp: any) => {
        // vaciamos el contador del header
        this.cartService.setTotalItems(0);
        this.toastr.success('Tu pedido se ha realizado correctamente', '¡Gracias por tu compra!');
        // redirigimos a la confirmación pasando el id del pedido
        this.router.navigate(['/order-confirmation', resp.sale.id]);
        this.procesando = false;
      },
      error: (err: any) => {
        const mensaje = err?.error?.error || 'Ha ocurrido un error al procesar el pedido';
        this.toastr.error(mensaje, 'Error');
        this.procesando = false;
      }
    });
  }
}

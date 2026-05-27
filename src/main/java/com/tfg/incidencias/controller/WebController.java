package com.tfg.incidencias.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/*
  Controlador principal de la aplicación web.

  Esta clase se encarga de asociar cada URL del panel
  con su correspondiente vista HTML de Thymeleaf.
*/
@Controller
public class WebController {

    /*
      Muestra el dashboard principal.
      Carga la plantilla index.html.
    */
    @GetMapping("/")
    public String index() {
        return "index";
    }

    /*
      Muestra la página de clientes.
      Carga la plantilla clientes.html.
    */
    @GetMapping("/clientes")
    public String clientes() {
        return "clientes";
    }

    /*
      Muestra el detalle de un cliente.
      Carga la plantilla cliente-detalle.html.
    */
    @GetMapping("/cliente-detalle")
    public String clienteDetalle() {
        return "cliente-detalle";
    }

    /*
      Muestra la página de configuración.
      Carga la plantilla configuracion.html.
    */
    @GetMapping("/configuracion")
    public String configuracion() {
        return "configuracion";
    }

    /*
      Muestra la página de estadísticas.
      Carga la plantilla estadisticas.html.
    */
    @GetMapping("/estadisticas")
    public String estadisticas() {
        return "estadisticas";
    }

    /*
      Muestra el detalle de una incidencia.
      Carga la plantilla incidencia.html.
    */
    @GetMapping("/incidencia")
    public String incidencia() {
        return "incidencia";
    }

    /*
      Muestra el formulario para crear una nueva incidencia.
      Carga la plantilla nueva-incidencia.html.
    */
    @GetMapping("/nueva-incidencia")
    public String nuevaIncidencia() {
        return "nueva-incidencia";
    }

    /*
      Muestra la página de pedidos.
      Carga la plantilla pedidos.html.
    */
    @GetMapping("/pedidos")
    public String pedidos() {
        return "pedidos";
    }

    /*
      Muestra el detalle de un pedido.
      Carga la plantilla pedido-detalle.html.
    */
    @GetMapping("/pedido-detalle")
    public String pedidoDetalle() {
        return "pedido-detalle";
    }

    /*
      Muestra la página de productos.
      Carga la plantilla productos.html.
    */
    @GetMapping("/productos")
    public String productos() {
        return "productos";
    }

    /*
      Muestra el detalle de un producto.
      Carga la plantilla producto-detalle.html.
    */
    @GetMapping("/producto-detalle")
    public String productoDetalle() {
        return "producto-detalle";
    }

    /*
      Muestra la pantalla de inicio de sesión.
      Carga la plantilla login.html.
    */
    @GetMapping("/login")
    public String login() {
        return "login";
    }

    /*
      Muestra el formulario para crear un nuevo producto.
      Carga la plantilla nuevo-producto.html.
    */
    @GetMapping("/nuevo-producto")
    public String nuevoProducto() {
        return "nuevo-producto";
    }
}
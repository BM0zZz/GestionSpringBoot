package com.tfg.incidencias.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/clientes")
    public String clientes() {
        return "clientes";
    }

    @GetMapping("/configuracion")
    public String configuracion() {
        return "configuracion";
    }

    @GetMapping("/estadisticas")
    public String estadisticas() {
        return "estadisticas";
    }

    @GetMapping("/incidencia")
    public String incidencia() {
        return "incidencia";
    }

    @GetMapping("/nueva-incidencia")
    public String nuevaIncidencia() {
        return "nueva-incidencia";
    }

    @GetMapping("/pedidos")
    public String pedidos() {
        return "pedidos";
    }

    @GetMapping("/pedido-detalle")
    public String pedidoDetalle() {
        return "pedido-detalle";
    }

    @GetMapping("/productos")
    public String productos() {
        return "productos";
    }

    @GetMapping("/producto-detalle")
    public String productoDetalle() {
        return "producto-detalle";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
package com.pdv.controllers;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.pdv.models.Client;

import com.pdv.services.ClientService;



@RestController
@RequestMapping("/api/clients")
@Validated
public class ClientController extends BaseController<Client> {
   
    protected ClientController(ClientService service) {
        super(service);
       
    }


}


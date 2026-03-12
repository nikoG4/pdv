package com.pdv.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.Client;
import com.pdv.repositories.ClientRepository;

@Service
public class ClientService extends BaseService<Client> {

    @Autowired
    private ClientRepository clientRepository;

    public ClientService(){
        this.repository = clientRepository;
        this.columns = List.of("id", "name", "ruc", "contactName", "email", "phone", "address");
    }

    @Override
    public Client update(Client client, Long id) {
        Client currentClient = clientRepository.findById(id).orElseThrow(() -> new RuntimeException("Client not found"));
        currentClient.setName(client.getName());
        currentClient.setRuc(client.getRuc());
        currentClient.setContactName(client.getContactName());
        currentClient.setEmail(client.getEmail());
        currentClient.setPhone(client.getPhone());
        currentClient.setAddress(client.getAddress());
        currentClient.setUpdatedBy(userInfoService.getCurrentUser());
        return clientRepository.save(currentClient);
    }


}


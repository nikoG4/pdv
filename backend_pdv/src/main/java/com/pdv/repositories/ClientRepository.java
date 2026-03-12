package com.pdv.repositories;

import org.springframework.stereotype.Repository;

import com.pdv.models.Client;


@Repository
public interface ClientRepository extends BaseRepository<Client, Long> {
}

package com.pdv.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "dashboard_configs")
@Data
@EqualsAndHashCode(callSuper = true)
public class DashboardConfig extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "config_json", nullable = false, columnDefinition = "TEXT")
    private String configJson;
}

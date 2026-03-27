package com.pdv.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "ai_provider_configs")
@Data
@EqualsAndHashCode(callSuper = true)
public class AIProviderConfig extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "OpenAI", "Gemini", "Claude"

    @Column(nullable = false)
    private String providerType; // enum: OPENAI, ANTHROPIC, GEMINI, LOCAL

    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(nullable = false)
    private String model; // e.g. "gpt-4o", "gemini-1.5-flash"

    @Column(nullable = false)
    private Integer priority; // lower value = higher priority

    @Column(nullable = false)
    private Boolean enabled = true;

    private String baseUrl; // used for custom/local providers

    @Column(columnDefinition = "TEXT")
    private String customPrompt; // Optional override for the standard extraction prompt

    @Column(columnDefinition = "TEXT")
    private String requestTemplate; // Template for the JSON request body (OpenAI compatible by default)

    @Column(columnDefinition = "TEXT")
    private String responsePath = "choices[0].message.content"; // JSON path to find the content in response (uses dot notation)

    @Column(columnDefinition = "TEXT")
    private String extraHeaders; // JSON string with extra headers
}

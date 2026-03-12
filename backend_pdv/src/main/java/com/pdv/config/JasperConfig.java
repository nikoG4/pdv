package com.pdv.config;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import net.sf.jasperreports.engine.DefaultJasperReportsContext;
import net.sf.jasperreports.engine.JRPropertiesUtil;
import net.sf.jasperreports.engine.JasperReportsContext;


@Configuration
public class JasperConfig {

    @PostConstruct
    public void addFont() {
        JasperReportsContext jasperReportsContext = DefaultJasperReportsContext.getInstance();

        // Registra la ruta de `fonts.xml`
        JRPropertiesUtil.getInstance(jasperReportsContext).setProperty(
            "net.sf.jasperreports.extension.registry.factory.fonts",
            "net.sf.jasperreports.engine.fonts.SimpleFontExtensionsRegistryFactory"
        );
        JRPropertiesUtil.getInstance(jasperReportsContext).setProperty(
            "net.sf.jasperreports.extension.simple.font.families.fonts",
            "fonts/fonts.xml"
        );
    }
}

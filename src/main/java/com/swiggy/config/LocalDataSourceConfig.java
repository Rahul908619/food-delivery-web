package com.swiggy.config;

import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Configuration
public class LocalDataSourceConfig {

    @Bean
    @Primary
    @Profile("local")
    public DataSource localMySqlDataSource(
            org.springframework.core.env.Environment environment
    ) {
        String url = requireLocalProperty(environment, "LOCAL_DATASOURCE_URL");
        String username = requireLocalProperty(environment, "LOCAL_DATASOURCE_USERNAME");
        String password = environment.getProperty("LOCAL_DATASOURCE_PASSWORD", "");

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }

    @Bean
    @Primary
    @Profile("test")
    public DataSource testH2DataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:h2:mem:fooddelivery;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE");
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        return dataSource;
    }

    private String requireLocalProperty(org.springframework.core.env.Environment environment, String key) {
        String value = environment.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(key + " is missing. Set it in .env before running the local profile.");
        }
        return value;
    }
}

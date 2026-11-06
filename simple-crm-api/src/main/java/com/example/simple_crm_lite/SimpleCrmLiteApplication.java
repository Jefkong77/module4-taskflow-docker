package com.example.simple_crm_lite;

import com.example.simple_crm_lite.model.Customer;
import com.example.simple_crm_lite.repository.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class SimpleCrmLiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(SimpleCrmLiteApplication.class, args);
    }

    @Bean
    CommandLineRunner loadSampleData(CustomerRepository customerRepository) {
        return args -> {
            if (customerRepository.count() == 0) {
                customerRepository.save(sample("Bruce", "Wayne", "bruce@wayneenterprises.com",
                        "11122233", "CEO", 1975, "Wayne Enterprises", "active", List.of("VIP")));
                customerRepository.save(sample("Diana", "Prince", "diana@themyscira.gov",
                        "22233344", "Ambassador", 1980, "Themyscira Embassy", "active", List.of("Referral")));
                customerRepository.save(sample("Clark", "Kent", "clark@dailyplanet.com",
                        "33344455", "Reporter", 1978, "Daily Planet", "inactive", List.of()));

                System.out.println("Sample data loaded: 3 customers added");
            }
        };
    }

    private static Customer sample(String first, String last, String email, String phone,
            String jobTitle, int yearOfBirth, String company, String status, List<String> tags) {
        Customer customer = new Customer(first, last, email, phone, jobTitle, yearOfBirth);
        customer.setCompany(company);
        customer.setStatus(status);
        customer.setTags(tags);
        return customer;
    }
}
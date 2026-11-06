package com.example.simple_crm_lite.controller;

import com.example.simple_crm_lite.model.Customer;
import com.example.simple_crm_lite.repository.CustomerRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerRepository customerRepository;

    @Test
    void testGetAllCustomers() throws Exception {
        // Arrange: create known customer data.
        Customer john = new Customer();
        john.setId(1L);
        john.setFirstName("John");
        john.setLastName("Doe");
        john.setEmail("john@example.com");

        Customer jane = new Customer();
        jane.setId(2L);
        jane.setFirstName("Jane");
        jane.setLastName("Smith");
        jane.setEmail("jane@example.com");

        when(customerRepository.findAll())
                .thenReturn(List.of(john, jane));

        // Act and assert: request the endpoint and check its response.
        mockMvc.perform(get("/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].firstName").value("John"))
                .andExpect(jsonPath("$[0].lastName").value("Doe"))
                .andExpect(jsonPath("$[1].firstName").value("Jane"))
                .andExpect(jsonPath("$[1].lastName").value("Smith"));
    }
}
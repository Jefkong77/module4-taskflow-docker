package com.example.simple_crm_lite.controller;

import com.example.simple_crm_lite.model.Customer;
import com.example.simple_crm_lite.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        customer.setId(null); // the database assigns the id
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** Full update: every field is replaced. */
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id, @RequestBody Customer updated) {
        return customerRepository.findById(id)
                .map(existing -> {
                    existing.setFirstName(updated.getFirstName());
                    existing.setLastName(updated.getLastName());
                    existing.setEmail(updated.getEmail());
                    existing.setContactNo(updated.getContactNo());
                    existing.setJobTitle(updated.getJobTitle());
                    existing.setYearOfBirth(updated.getYearOfBirth());
                    existing.setStatus(updated.getStatus());
                    existing.setCompany(updated.getCompany());
                    existing.setNotes(updated.getNotes());
                    existing.setTags(updated.getTags());
                    return ResponseEntity.ok(customerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Module 4, Option 3: partial update. The Module 2 React frontend sends PATCH
     * with only the changed fields, so only non-null fields are copied.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<Customer> patchCustomer(
            @PathVariable Long id, @RequestBody Customer changes) {
        return customerRepository.findById(id)
                .map(existing -> {
                    if (changes.getFirstName() != null) existing.setFirstName(changes.getFirstName());
                    if (changes.getLastName() != null) existing.setLastName(changes.getLastName());
                    if (changes.getEmail() != null) existing.setEmail(changes.getEmail());
                    if (changes.getContactNo() != null) existing.setContactNo(changes.getContactNo());
                    if (changes.getJobTitle() != null) existing.setJobTitle(changes.getJobTitle());
                    if (changes.getYearOfBirth() != null) existing.setYearOfBirth(changes.getYearOfBirth());
                    if (changes.getStatus() != null) existing.setStatus(changes.getStatus());
                    if (changes.getCompany() != null) existing.setCompany(changes.getCompany());
                    if (changes.getNotes() != null) existing.setNotes(changes.getNotes());
                    if (changes.getTags() != null && !changes.getTags().isEmpty()) {
                        existing.setTags(changes.getTags());
                    }
                    return ResponseEntity.ok(customerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

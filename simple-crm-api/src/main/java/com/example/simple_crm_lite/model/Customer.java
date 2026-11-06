package com.example.simple_crm_lite.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Module 4, Option 3: the original Lesson 4.11 fields are kept, and the fields the
 * Module 2 React frontend uses (status, company, tags, notes, createdAt, phone)
 * are added so the frontend can talk to this API without a rewrite.
 */
@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String email;

    // The frontend calls this "phone"; see getPhone/setPhone below.
    private String contactNo;

    private String jobTitle;
    private Integer yearOfBirth;

    // Added for the Module 2 frontend.
    private String status = "active";
    private String company;
    private String notes;
    private LocalDate createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tags = new ArrayList<>();

    public Customer() {
    }

    public Customer(String firstName, String lastName, String email,
                    String contactNo, String jobTitle, Integer yearOfBirth) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.contactNo = contactNo;
        this.jobTitle = jobTitle;
        this.yearOfBirth = yearOfBirth;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDate.now();
        }
        if (status == null) {
            status = "active";
        }
    }

    /** "phone" in JSON is the frontend's name for contactNo (same database column). */
    public String getPhone() {
        return contactNo;
    }

    public void setPhone(String phone) {
        if (phone != null) {
            this.contactNo = phone;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { this.contactNo = contactNo; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public Integer getYearOfBirth() { return yearOfBirth; }
    public void setYearOfBirth(Integer yearOfBirth) { this.yearOfBirth = yearOfBirth; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) {
        this.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags);
    }
}

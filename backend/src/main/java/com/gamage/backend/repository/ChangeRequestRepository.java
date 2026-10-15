
package com.gamage.backend.repository;

import com.gamage.backend.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ChangeRequestRepository
        extends JpaRepository<ChangeRequest, Long> {

    // Get all requests belonging to a student
    @EntityGraph(attributePaths = {"student"})
    List<ChangeRequest> findByStudent_IdOrderByCreatedAtDesc(Long studentId);

    // Get all requests ordered by newest first
    @EntityGraph(attributePaths = {"student"})
    List<ChangeRequest> findAllByOrderByCreatedAtDesc();

    // Get requests by status
    @EntityGraph(attributePaths = {"student"})
    List<ChangeRequest> findByStatusOrderByCreatedAtDesc(String status);
}


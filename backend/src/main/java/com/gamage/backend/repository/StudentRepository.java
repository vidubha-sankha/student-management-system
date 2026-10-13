package com.gamage.backend.repository;

import com.gamage.backend.entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCourseId(Long courseId);

    @Override
    @EntityGraph(attributePaths = {"course"})
    List<Student> findAll();

    @Override
    @EntityGraph(attributePaths = {"course"})
    Optional<Student> findById(Long id);
}

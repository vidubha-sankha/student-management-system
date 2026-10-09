import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Student Management System
          </h1>
          <p className={styles.subtitle}>
            Manage students and courses in one place
          </p>
        </header>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Students</p>
            <h2 className={styles.statValue}>0</h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Courses</p>
            <h2 className={styles.statValue}>0</h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>System Status</p>
            <h2 className={styles.statStatus}>
              Frontend Ready
            </h2>
          </div>
        </section>

        <section className={styles.mainSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Students</h2>
            <button
              type="button"
              className={styles.addButton}
            >
              + Add Student
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No students yet. Add your first student soon.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
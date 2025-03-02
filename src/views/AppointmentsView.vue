<template>
  <div class="appointments-view">
    <div class="appointments-header">
      <h2>Appointments</h2>
      <div class="filters">
        <select v-model="filter">
          <option value="all">All Appointments</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <div class="appointments-grid">
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const filter = ref('all')
</script>

<style scoped>
.appointments-view {
  padding: 1rem;
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.appointment-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.appointment-card.upcoming { border-left: 4px solid #3498db; }
.appointment-card.completed { border-left: 4px solid #2ecc71; }
.appointment-card.cancelled { border-left: 4px solid #e74c3c; }

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  text-transform: capitalize;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.appointment-details p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.appointment-details i {
  width: 1rem;
  color: #3498db;
}
</style>
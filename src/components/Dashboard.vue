<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dental Clinic</h1>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </header>
      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="stat-info">
              <h3>Total Patients</h3>
              <p>{{ totalPatients }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="stat-info">
              <h3>Today's Appointments</h3>
              <p>{{ todayAppointments }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="stat-info">
              <h3>Pending Appointments</h3>
              <p>{{ pendingAppointments }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabaseClient.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const totalPatients = ref(0)
const todayAppointments = ref(0)
const pendingAppointments = ref(0)

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(async () => {
  // Here you would fetch actual data from Supabase
  // For now using placeholder data
  totalPatients.value = 150
  todayAppointments.value = 8
  pendingAppointments.value = 12
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  background: #e3f2fd;
  padding: 1rem;
  border-radius: 12px;
  margin-right: 1rem;
}

.icon {
  width: 2rem;
  height: 2rem;
  color: #1976d2;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  margin: 0 0 0.5rem 0;
  color: #546e7a;
  font-size: 1rem;
}

.stat-info p {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 0;
  color: #2c3e50;
}

.logout-btn {
  padding: 0.75rem 1.5rem;
  background-color: #ff5252;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #ff1744;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-info p {
    font-size: 1.5rem;
  }
}
</style>
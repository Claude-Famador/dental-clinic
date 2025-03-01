<template>
  <div class="patients-view">
    <div class="header-actions">
      <h2>Patient Management</h2>
      <button @click="showAddPatient = true" class="add-btn">
        <i class="fas fa-plus"></i> Add Patient
      </button>
    </div>

    <div class="search-filters">
      <input 
        v-model="searchQuery" 
        type="search" 
        placeholder="Search patients..."
        @input="searchPatients"
      />
    </div>

    <div class="patients-grid">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Last Visit</th>
            <th>Next Appointment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in patients" :key="patient.id">
            <td>{{ patient.first_name }} {{ patient.last_name }}</td>
            <td>
              <div>{{ patient.email }}</div>
              <div>{{ patient.phone }}</div>
            </td>
            <td>{{ formatDate(patient.last_visit) }}</td>
            <td>{{ patient.next_appointment ? formatDate(patient.next_appointment) : 'None' }}</td>
            <td>
              <button @click="viewPatient(patient.id)" class="action-btn">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editPatient(patient.id)" class="action-btn">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Patient Modal -->
    <div v-if="showAddPatient" class="modal">
      <div class="modal-content">
        <h3>Add New Patient</h3>
        <form @submit.prevent="handleAddPatient">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="newPatient.first_name" required />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input v-model="newPatient.last_name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="newPatient.email" required />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="newPatient.phone" required />
          </div>
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" v-model="newPatient.dob" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddPatient = false">Cancel</button>
            <button type="submit">Save Patient</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const patients = ref([])
const showAddPatient = ref(false)
const searchQuery = ref('')

const newPatient = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  dob: ''
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const fetchPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching patients:', error)
    return
  }

  patients.value = data
}

const handleAddPatient = async () => {
  const { error } = await supabase
    .from('patients')
    .insert([newPatient.value])

  if (error) {
    console.error('Error adding patient:', error)
    return
  }

  showAddPatient.value = false
  await fetchPatients()
  newPatient.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: ''
  }
}

const searchPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .or(`first_name.ilike.%${searchQuery.value}%,last_name.ilike.%${searchQuery.value}%,email.ilike.%${searchQuery.value}%`)

  if (error) {
    console.error('Error searching patients:', error)
    return
  }

  patients.value = data
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.patients-view {
  padding: 1rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-filters {
  margin-bottom: 1rem;
}

.search-filters input {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.patients-grid {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.action-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  margin-right: 0.5rem;
}

.action-btn:hover {
  color: #000;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="submit"] {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.modal-actions button[type="button"] {
  background-color: #ddd;
  border: none;
}
</style>
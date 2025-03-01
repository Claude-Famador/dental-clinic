<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Transactions</h1>
        <button
          @click="openNewTransactionModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          New Transaction
        </button>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading transactions...</p>
      </div>

      <div v-else class="transactions-list">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="table-header">Date</th>
                <th scope="col" class="table-header">Client</th>
                <th scope="col" class="table-header">Amount</th>
                <th scope="col" class="table-header">Method</th>
                <th scope="col" class="table-header">Staff</th>
                <th scope="col" class="table-header">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
                <td class="table-cell">{{ formatDate(transaction.trans_date) }}</td>
                <td class="table-cell">{{ transaction.client_name }}</td>
                <td class="table-cell">${{ transaction.trans_amount }}</td>
                <td class="table-cell">{{ transaction.trans_method }}</td>
                <td class="table-cell">{{ transaction.staff_name }}</td>
                <td class="table-cell">
                  <button
                    @click="viewTransactionDetails(transaction)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- New Transaction Modal -->
        <div v-if="showNewTransactionModal" class="modal-backdrop">
          <div class="modal-content">
            <h2 class="text-lg font-medium mb-4">New Transaction</h2>
            <form @submit.prevent="createTransaction" class="space-y-4">
              <div class="form-group">
                <label for="client" class="block text-sm font-medium text-gray-700">Client</label>
                <select
                  id="client"
                  v-model="newTransaction.client_name"
                  class="form-select"
                  required
                >
                  <option value="">Select a client</option>
                  <option v-for="client in clients" :key="client.id" :value="client.name">
                    {{ client.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  id="amount"
                  v-model="newTransaction.trans_amount"
                  class="form-input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="form-group">
                <label for="method" class="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  id="method"
                  v-model="newTransaction.trans_method"
                  class="form-select"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="INSURANCE">Insurance</option>
                </select>
              </div>

              <div class="modal-actions">
                <button
                  type="button"
                  @click="showNewTransactionModal = false"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="loading">
                  Create Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

interface Transaction {
  id: string
  trans_date: string
  trans_amount: number
  trans_method: string
  client_name: string
  staff_name: string
}

interface Client {
  id: string
  name: string
}

const transactions = ref<Transaction[]>([])
const clients = ref<Client[]>([])
const loading = ref(false)
const showNewTransactionModal = ref(false)

const newTransaction = ref({
  client_name: '',
  trans_amount: 0,
  trans_method: ''
})

async function fetchTransactions() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('transaction')
      .select('*')
      .order('trans_date', { ascending: false })

    if (error) throw error

    transactions.value = data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    loading.value = false
  }
}

async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('client')
      .select('id, name')
      .order('name')

    if (error) throw error

    clients.value = data || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

async function createTransaction() {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No user found')

    const { error } = await supabase
      .from('transaction')
      .insert([
        {
          trans_date: new Date().toISOString(),
          ...newTransaction.value,
          staff_name: user.email // Using email as staff name for now
        }
      ])

    if (error) throw error

    showNewTransactionModal.value = false
    await fetchTransactions()
  } catch (error) {
    console.error('Error creating transaction:', error)
  } finally {
    loading.value = false
  }
}

function openNewTransactionModal() {
  showNewTransactionModal.value = true
}

function viewTransactionDetails(transaction: Transaction) {
  // Implement transaction details view
  console.log('View transaction:', transaction)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchTransactions()
  fetchClients()
})
</script>

<style scoped>
.transactions-list {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.table-header {
  padding: 0.75rem;
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
}

.table-cell {
  padding: 1rem;
  white-space: nowrap;
  font-size: 0.875rem;
  color: #374151;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 32rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
</style>
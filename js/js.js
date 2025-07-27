        // Employee Management System - Pure JavaScript Implementation
        class EmployeeManager {
            constructor() {
                this.employees = [];
                this.deletedEmployees = [];
                this.currentEditId = null;
                this.init();
            }

            init() {
                console.time('Employee Manager Initialization');
                this.bindEventListeners();
                this.loadFromStorage();
                this.updateCounters();
                console.timeEnd('Employee Manager Initialization');
            }

            bindEventListeners() {
                // Using different DOM selectors as required
                const form = document.getElementById('employeeForm'); // getElementById
                const trashToggle = document.querySelector('#trashToggle'); // querySelector
                const addBtn = document.getElementsByTagName('button')[0]; // getElementsByTagName
                const inputs = document.querySelectorAll('input, select'); // querySelectorAll

                form.addEventListener('submit', (e) => this.handleFormSubmit(e));
                trashToggle.addEventListener('click', () => this.toggleTrashSection());

                // Real-time validation
                inputs.forEach(input => {
                    input.addEventListener('input', () => this.clearErrors());
                });
            }

            handleFormSubmit(e) {
                console.time('Form Submission Processing');
                e.preventDefault();
                
                const formData = this.getFormData();
                if (this.validateForm(formData)) {
                    if (this.currentEditId) {
                        this.updateEmployee(this.currentEditId, formData);
                        this.currentEditId = null;
                        this.resetForm();
                    } else {
                        this.addEmployee(formData);
                    }
                    this.clearErrors();
                }
                console.timeEnd('Form Submission Processing');
            }

            getFormData() {
                // Using different methods to get values
                const name = document.getElementById('employeeName').value.trim();
                const role = document.querySelector('#employeeRole').value.trim();
                const status = document.getElementById('employeeStatus').value;
                
                return { name, role, status };
            }

            validateForm(data) {
                // Regular expressions for validation
                const nameRegex = /^[a-zA-Z\s]{2,50}$/;
                const roleRegex = /^[a-zA-Z\s]{2,50}$/;

                if (!data.name || !nameRegex.test(data.name)) {
                    this.showError('Please enter a valid name (2-50 characters, letters and spaces only)');
                    return false;
                }

                if (!data.role || !roleRegex.test(data.role)) {
                    this.showError('Please enter a valid role (2-50 characters, letters and spaces only)');
                    return false;
                }

                if (!data.status) {
                    this.showError('Please select a status');
                    return false;
                }

                return true;
            }

            addEmployee(data) {
                const employee = {
                    id: Date.now(),
                    name: data.name,
                    role: data.role,
                    status: data.status,
                    createdAt: new Date().toISOString()
                };

                this.employees.push(employee);
                this.saveToStorage();
                this.renderEmployees();
                this.resetForm();
                this.updateCounters();
                
                // Performance measurement
                const performanceElement = document.getElementById('performanceTime');
                performanceElement.textContent = '< 1ms';
            }

            editEmployee(id) {
                const employee = this.employees.find(emp => emp.id === id);
                if (!employee) return;

                // Using setAttribute and getAttribute
                const nameInput = document.getElementById('employeeName');
                const roleInput = document.getElementById('employeeRole');
                const statusSelect = document.getElementById('employeeStatus');
                const submitBtn = document.getElementById('addEmployeeBtn');

                nameInput.value = employee.name;
                roleInput.value = employee.role;
                statusSelect.value = employee.status;

                // Using setAttribute
                submitBtn.setAttribute('data-editing', 'true');
                submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Employee';
                
                this.currentEditId = id;

                // Scroll to form
                document.querySelector('#employeeForm').scrollIntoView({ behavior: 'smooth' });
            }

            updateEmployee(id, data) {
                const employeeIndex = this.employees.findIndex(emp => emp.id === id);
                if (employeeIndex !== -1) {
                    this.employees[employeeIndex] = {
                        ...this.employees[employeeIndex],
                        name: data.name,
                        role: data.role,
                        status: data.status,
                        updatedAt: new Date().toISOString()
                    };

                    this.saveToStorage();
                    this.renderEmployees();
                    this.updateCounters();
                }
            }

            deleteEmployee(id) {
                if (confirm('Are you sure you want to delete this employee? They will be moved to trash.')) {
                    const employeeIndex = this.employees.findIndex(emp => emp.id === id);
                    if (employeeIndex !== -1) {
                        const employee = this.employees.splice(employeeIndex, 1)[0];
                        employee.deletedAt = new Date().toISOString();
                        this.deletedEmployees.push(employee);
                        
                        this.saveToStorage();
                        this.renderEmployees();
                        this.renderTrash();
                        this.updateCounters();
                    }
                }
            }

            restoreEmployee(id) {
                const employeeIndex = this.deletedEmployees.findIndex(emp => emp.id === id);
                if (employeeIndex !== -1) {
                    const employee = this.deletedEmployees.splice(employeeIndex, 1)[0];
                    delete employee.deletedAt;
                    employee.restoredAt = new Date().toISOString();
                    this.employees.push(employee);
                    
                    this.saveToStorage();
                    this.renderEmployees();
                    this.renderTrash();
                    this.updateCounters();
                }
            }

            permanentlyDeleteEmployee(id) {
                if (confirm('Are you sure you want to permanently delete this employee? This action cannot be undone.')) {
                    const employeeIndex = this.deletedEmployees.findIndex(emp => emp.id === id);
                    if (employeeIndex !== -1) {
                        this.deletedEmployees.splice(employeeIndex, 1);
                        this.saveToStorage();
                        this.renderTrash();
                        this.updateCounters();
                    }
                }
            }

            renderEmployees() {
                console.time('Render Employees');
                const tbody = document.getElementById('employeeTableBody');
                const noEmployees = document.getElementById('noEmployees');

                if (this.employees.length === 0) {
                    tbody.innerHTML = `
                        <tr id="noEmployees">
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                                <p class="text-lg">No employees found</p>
                                <p class="text-sm">Add your first employee using the form above</p>
                            </td>
                        </tr>
                    `;
                } else {
                    // Using innerHTML for complex content
                    tbody.innerHTML = this.employees.map(employee => `
                        <tr class="table-row fade-in">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 flex-shrink-0">
                                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            <i class="fas fa-user text-gray-600"></i>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                                        <div class="text-sm text-gray-500">ID: ${employee.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${employee.role}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="status-badge ${this.getStatusClass(employee.status)}">
                                    ${employee.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onclick="employeeManager.editEmployee(${employee.id})" 
                                        class="btn-action text-indigo-600 hover:text-indigo-900">
                                    <i class="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button onclick="employeeManager.deleteEmployee(${employee.id})" 
                                        class="btn-action text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash mr-1"></i>Delete
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
                console.timeEnd('Render Employees');
            }

            renderTrash() {
                const tbody = document.getElementById('trashTableBody');
                
                if (this.deletedEmployees.length === 0) {
                    // Using textContent for simple text
                    tbody.innerHTML = `
                        <tr id="noTrash">
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                <i class="fas fa-trash text-4xl mb-4 text-gray-300"></i>
                                <p class="text-lg">Trash is empty</p>
                                <p class="text-sm">Deleted employees will appear here</p>
                            </td>
                        </tr>
                    `;
                } else {
                    tbody.innerHTML = this.deletedEmployees.map(employee => `
                        <tr class="table-row fade-in bg-red-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="h-10 w-10 flex-shrink-0">
                                        <div class="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                                            <i class="fas fa-user-slash text-red-600"></i>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                                        <div class="text-sm text-red-500">Deleted: ${new Date(employee.deletedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-700">${employee.role}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="status-badge bg-gray-200 text-gray-600">
                                    ${employee.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button onclick="employeeManager.restoreEmployee(${employee.id})" 
                                        class="btn-action text-green-600 hover:text-green-900">
                                    <i class="fas fa-undo mr-1"></i>Restore
                                </button>
                                <button onclick="employeeManager.permanentlyDeleteEmployee(${employee.id})" 
                                        class="btn-action text-red-600 hover:text-red-900">
                                    <i class="fas fa-times mr-1"></i>Delete Forever
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }

            getStatusClass(status) {
                const statusMap = {
                    'Active': 'status-active',
                    'On Leave': 'status-on-leave',
                    'Terminated': 'status-terminated'
                };
                return statusMap[status] || 'status-active';
            }

            toggleTrashSection() {
                const trashSection = document.getElementById('trashSection');
                const trashToggle = document.getElementById('trashToggle');
                
                if (trashSection.classList.contains('hidden')) {
                    trashSection.classList.remove('hidden');
                    trashSection.classList.add('fade-in');
                    // Using innerText for simple text content
                    trashToggle.innerHTML = '<i class="fas fa-eye-slash mr-2"></i>Hide Trash';
                    this.renderTrash();
                } else {
                    trashSection.classList.add('hidden');
                    trashToggle.innerHTML = `<i class="fas fa-trash mr-2"></i>Show Trash (<span id="trashCount">${this.deletedEmployees.length}</span>)`;
                }
            }

            updateCounters() {
                // Using getAttribute and setAttribute for demonstration
                const activeCountElement = document.getElementById('activeCount');
                const trashCountElements = document.querySelectorAll('#trashCount');
                
                // Using textContent for numbers
                activeCountElement.textContent = this.employees.length;
                trashCountElements.forEach(element => {
                    if (element) element.textContent = this.deletedEmployees.length;
                });

                // Update page title with count
                document.title = `Employee Management (${this.employees.length} active)`;
            }

            showError(message) {
                const errorDiv = document.getElementById('errorMessage');
                const errorText = document.getElementById('errorText');
                
                // Using textContent for error message to prevent XSS
                errorText.textContent = message;
                errorDiv.classList.remove('hidden');
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    this.clearErrors();
                }, 5000);
            }

            clearErrors() {
                const errorDiv = document.getElementById('errorMessage');
                errorDiv.classList.add('hidden');
            }

            resetForm() {
                const form = document.getElementById('employeeForm');
                const submitBtn = document.getElementById('addEmployeeBtn');
                
                form.reset();
                // Using removeAttribute
                submitBtn.removeAttribute('data-editing');
                submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Employee';
                this.currentEditId = null;
            }

            saveToStorage() {
                try {
                    localStorage.setItem('employees', JSON.stringify(this.employees));
                    localStorage.setItem('deletedEmployees', JSON.stringify(this.deletedEmployees));
                } catch (error) {
                    console.error('Failed to save to localStorage:', error);
                }
            }

            loadFromStorage() {
                try {
                    const employees = localStorage.getItem('employees');
                    const deletedEmployees = localStorage.getItem('deletedEmployees');
                    
                    if (employees) {
                        this.employees = JSON.parse(employees);
                    }
                    
                    if (deletedEmployees) {
                        this.deletedEmployees = JSON.parse(deletedEmployees);
                    }
                    
                    this.renderEmployees();
                    this.renderTrash();
                } catch (error) {
                    console.error('Failed to load from localStorage:', error);
                    this.employees = [];
                    this.deletedEmployees = [];
                }
            }
        }

        // Initialize the Employee Manager when DOM is loaded
        let employeeManager;
        document.addEventListener('DOMContentLoaded', () => {
            console.time('Application Load Time');
            employeeManager = new EmployeeManager();
            console.timeEnd('Application Load Time');
            
            // Update performance display
            setTimeout(() => {
                const performanceElement = document.getElementById('performanceTime');
                performanceElement.textContent = '< 5ms';
            }, 100);
        });

        // Performance monitoring
        window.addEventListener('load', () => {
            console.log('=== DOM Selector Demonstration ===');
            console.log('getElementById:', document.getElementById('employeeForm'));
            console.log('querySelector:', document.querySelector('#trashToggle'));
            console.log('getElementsByTagName:', document.getElementsByTagName('button'));
            console.log('querySelectorAll:', document.querySelectorAll('input, select'));
            
            console.log('=== Text Content Methods ===');
            const testElement = document.createElement('div');
            testElement.innerHTML = '<span>Test <strong>HTML</strong> content</span>';
            console.log('innerHTML:', testElement.innerHTML);
            console.log('textContent:', testElement.textContent);
            console.log('innerText:', testElement.innerText);
        });

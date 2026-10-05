const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.getElementById("employeeTableBody");
const departmentSelect = document.getElementById("department");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");

const checkInButton = document.getElementById("checkInButton");
const checkOutButton = document.getElementById("checkOutButton");

let editingEmployeeId = null;


// ================================
// LOAD DEPARTMENTS
// ================================

async function loadDepartments() {

    if (!departmentSelect) {
        return;
    }

    try {

        const response = await fetch("/departments");

        const result = await response.json();

        departmentSelect.innerHTML =
            '<option value="">Select Department</option>';

        result.data.forEach(department => {

            const option = document.createElement("option");

            option.value = department._id;

            option.textContent = department.name;

            departmentSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Error loading departments:", error);

    }
}


// LOAD EMPLOYEES
async function loadEmployees() {
    if (!employeeTableBody) {
        return;
    }

    try {
        const response = await fetch("/employees");
        const result = await response.json();

        employeeTableBody.innerHTML = "";

        result.data.forEach(employee => {
            const row = document.createElement("tr");

            const departmentName = employee.department
                ? employee.department.name
                : "No Department";

            row.innerHTML = `
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.age}</td>
                <td>₹${employee.salary}</td>
                <td>${departmentName}</td>
                <td>
                    <button onclick="editEmployee('${employee._id}')">
                        Edit
                    </button>
                    <button onclick="deleteEmployee('${employee._id}')">
                        Delete
                    </button>
                </td>
            `;

            employeeTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading employees:", error);
    }
}

// ================================
// ADD / UPDATE EMPLOYEE
// ================================

if (employeeForm) {

    employeeForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const employeeData = {

            name: document.getElementById("name").value,

            email: document.getElementById("email").value,

            age: document.getElementById("age").value,

            salary: document.getElementById("salary").value,

            department: departmentSelect.value

        };


        try {

            let response;


            // UPDATE EMPLOYEE

            if (editingEmployeeId) {

                response = await fetch(
                    `/employees/${editingEmployeeId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(employeeData)
                    }
                );

            }


            // ADD EMPLOYEE

            else {

                response = await fetch(
                    "/employees",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(employeeData)
                    }
                );

            }


            const result = await response.json();

            console.log(result);


            // RESET FORM

            employeeForm.reset();

            editingEmployeeId = null;

            submitButton.textContent = "Add Employee";

            formTitle.textContent = "Add Employee";

            cancelButton.style.display = "none";


            // Reload employee list

            loadEmployees();


            // Reload dashboard

            loadDashboard();

        } catch (error) {

            console.error("Error saving employee:", error);

        }

    });

}


// ================================
// EDIT EMPLOYEE
// ================================

async function editEmployee(id) {

    try {

        const response =
            await fetch(`/employees/${id}`);

        const result =
            await response.json();

        const employee = result.data;


        document.getElementById("name").value =
            employee.name;

        document.getElementById("email").value =
            employee.email;

        document.getElementById("age").value =
            employee.age;

        document.getElementById("salary").value =
            employee.salary;

        departmentSelect.value =
            employee.department._id;


        editingEmployeeId = employee._id;


        submitButton.textContent =
            "Update Employee";

        formTitle.textContent =
            "Update Employee";

        cancelButton.style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Error getting employee:",
            error
        );

    }

}


// ================================
// DELETE EMPLOYEE
// ================================

async function deleteEmployee(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this employee?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `/employees/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();

        console.log(result);


        loadEmployees();

        loadDashboard();

    } catch (error) {

        console.error(
            "Error deleting employee:",
            error
        );

    }

}


// ================================
// CANCEL EDIT
// ================================

if (cancelButton) {

    cancelButton.addEventListener("click", () => {

        employeeForm.reset();

        editingEmployeeId = null;

        submitButton.textContent =
            "Add Employee";

        formTitle.textContent =
            "Add Employee";

        cancelButton.style.display =
            "none";

    });

}


// ================================
// LOAD DASHBOARD
// ================================

async function loadDashboard() {

    const totalEmployees =
        document.getElementById("totalEmployees");

    const totalDepartments =
        document.getElementById("totalDepartments");


    if (!totalEmployees || !totalDepartments) {
        return;
    }


    try {

        const response =
            await fetch("/dashboard");

        const result =
            await response.json();


        totalEmployees.textContent =
            result.totalEmployees;

        totalDepartments.textContent =
            result.totalDepartments;


    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

    }

}
// ================================
// ATTENDANCE
// ================================

let currentEmployeeId = null;

// GET LOGGED-IN EMPLOYEE
async function getLoggedInEmployee() {
    try {
        const params = new URLSearchParams(window.location.search);
        const username = params.get("username");

        if (!username) {
            console.error("Username not found");
            return;
        }

        const response = await fetch(
            `/employee-by-username/${encodeURIComponent(username)}`
        );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message);
            return;
        }

        currentEmployeeId = result.data._id;

        console.log("Logged-in employee ID:", currentEmployeeId);

    } catch (error) {
        console.error("Error finding employee:", error);
    }
}


// CHECK IN
if (checkInButton) {
    checkInButton.addEventListener("click", async () => {

        if (!currentEmployeeId) {
            alert("Employee information not loaded");
            return;
        }

        try {
            const response = await fetch("/attendance/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    employeeId: currentEmployeeId
                })
            });

            const result = await response.json();

            alert(result.message);

            console.log(result);

        } catch (error) {
            console.error("Check-in error:", error);
            alert("Check-in failed");
        }
    });
}


// CHECK OUT
if (checkOutButton) {
    checkOutButton.addEventListener("click", async () => {

        if (!currentEmployeeId) {
            alert("Employee information not loaded");
            return;
        }

        try {
            const response = await fetch("/attendance/check-out", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    employeeId: currentEmployeeId
                })
            });

            const result = await response.json();

            alert(result.message);

            console.log(result);

        } catch (error) {
            console.error("Check-out error:", error);
            alert("Check-out failed");
        }
    });
}

// LOAD TODAY'S ATTENDANCE
async function loadTodayAttendance() {
    const attendanceTableBody =
        document.getElementById("attendanceTableBody");

    if (!attendanceTableBody) {
        return;
    }

    try {
        const response = await fetch("/attendance/today");
        const result = await response.json();

        console.log("Today's attendance:", result);

        attendanceTableBody.innerHTML = "";

        result.data.forEach(attendance => {
            const row = document.createElement("tr");

            const employeeName =
                attendance.employee
                    ? attendance.employee.name
                    : "Unknown";

            const departmentName =
                attendance.employee &&
                attendance.employee.department
                    ? attendance.employee.department.name
                    : "Unknown";

            row.innerHTML = `
                <td>${employeeName}</td>
                <td>${departmentName}</td>
                <td>${attendance.checkIn || "--"}</td>
                <td>${attendance.checkOut || "--"}</td>
                <td>
                    <span class="${
                        attendance.status === "Present"
                            ? "status-present"
                            : "status-absent"
                    }">
                        ${attendance.status}
                    </span>
                </td>
            `;

            attendanceTableBody.appendChild(row);
        });

    } catch (error) {
        console.error(
            "Error loading today's attendance:",
            error
        );
    }
}
// LOAD SALARY SUMMARY
async function loadSalarySummary() {
    const salaryTableBody = document.getElementById("salaryTableBody");

    if (!salaryTableBody) return;

    try {
        const response = await fetch("/salary-summary");
        const result = await response.json();

        salaryTableBody.innerHTML = "";

        result.data.forEach(employee => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employee.employee}</td>
                <td>₹${employee.monthlySalary}</td>
                <td>${employee.workingDays}</td>
                <td>${employee.presentDays}</td>
                <td>₹${employee.calculatedSalary}</td>
            `;

            salaryTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading salary summary:", error);
    }
}

// LOAD EMPLOYEE ATTENDANCE AND SALARY
async function loadEmployeeSalary() {
    try {
        const params = new URLSearchParams(window.location.search);
        const username = params.get("username");

        if (!username) return;

        // Get employee information
        const employeeResponse = await fetch(
            `/employee-by-username/${encodeURIComponent(username)}`
        );

        const employeeResult = await employeeResponse.json();

        if (!employeeResponse.ok) {
            console.error(employeeResult.message);
            return;
        }

        const employee = employeeResult.data;
         

        const myEmployeeTableBody =
    document.getElementById("myEmployeeTableBody");

if (myEmployeeTableBody) {

    myEmployeeTableBody.innerHTML = `
        <tr>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.age}</td>
            <td>₹${employee.salary}</td>
            <td>${employee.department ? employee.department.name : "No Department"}</td>
        </tr>
    `;

}
        // Get attendance records
        const attendanceResponse = await fetch(
            `/attendance/${employee._id}`
        );

        const attendanceResult = await attendanceResponse.json();

        const attendance = attendanceResult.data || [];

        // Calculate present days
        const presentDays = attendance.filter(
            record => record.status === "Present"
        ).length;

        const workingDays = 26;

        const absentDays = workingDays - presentDays;

        const monthlySalary = Number(employee.salary) || 0;

        const calculatedSalary =
            (monthlySalary / workingDays) * presentDays;

        // Update dashboard
        document.getElementById("workingDays").textContent =
            workingDays;

        document.getElementById("presentDays").textContent =
            presentDays;

        document.getElementById("absentDays").textContent =
            absentDays;

        document.getElementById("monthlySalary").textContent =
            `₹${monthlySalary}`;

        document.getElementById("salaryWorkingDays").textContent =
            workingDays;

        document.getElementById("salaryPresentDays").textContent =
            presentDays;

        document.getElementById("calculatedSalary").textContent =
            `₹${Math.round(calculatedSalary)}`;

    } catch (error) {
        console.error(
            "Error loading employee salary:",
            error
        );
    }
}


// START
getLoggedInEmployee();

// ================================
// START APPLICATION
// ================================

loadDepartments();

loadEmployees();

loadDashboard();

loadTodayAttendance();

loadSalarySummary();

loadEmployeeSalary();
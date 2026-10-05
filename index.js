const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("./employee");
const Department = require("./department");
const Attendance = require("./attendance");

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });


  // REGISTER USER
app.post("/register", async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    const newUser = new User({
      fullName,
      username,
      password,
      role:"employee"
    });

    await newUser.save();
res.redirect("/login.html");
    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

 
// LOGIN USER
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "No account found"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }   

    if (user.role === "admin") {
    res.redirect("/admin.html");
    } else if (user.role === "employee") {
    res.redirect(
        `/employees.html?username=${encodeURIComponent(user.username)}`
    );
   } else {
    res.status(403).json({
        message: "Invalid user role"
    });
}

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});



  app.post("/departments", async (req, res) => {
  try {
    const { name, location } = req.body;

    const data = await Department.create({
      name,
      location
    });

    res.status(201).json({
      message: "Department created successfully",
      data: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

//read
app.get("/departments", async (req, res) => {
  try {
    const data = await Department.find();

    res.json({
      message: "Departments fetched successfully",
      data: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

//one read

app.get("/departments/:id", async (req, res) => {
  try {
    const data = await Department.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.json({
      data: data
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid department ID",
      error: error.message
    });
  }
});

//update
app.put("/departments/:id", async (req, res) => {
  try {
    const data = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!data) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.json({
      message: "Department updated successfully",
      data: data
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid department data",
      error: error.message
    });
  }
});

//deletee

app.delete("/departments/:id", async (req, res) => {
  try {
    const data = await Department.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.json({
      message: "Department deleted successfully",
      data: data
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid department ID",
      error: error.message
    });
  }
});

// CREATE Employee
app.post("/employees", async (req, res) => {
  try {
    const { name, email, age, salary, department } = req.body;

    const data = await Employee.create({
      name,
      email,
      age,
      salary,
      department
    });

    res.status(201).json({
      message: "Employee created successfully",
      data: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});



// READ - All Employees
app.get("/employees", async (req, res) => {
  try {
    const data = await Employee.find().populate("department");

    res.json({
      message: "Employees fetched successfully",
      data: data
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// READ - Single Employee
app.get("/employees/:id", async (req, res) => {
  try {
    const data = await Employee.findById(req.params.id)
      .populate("department");

    if (!data) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee fetched successfully",
      data: data
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid employee ID",
      error: error.message
    });
  }
});

// UPDATE Employee
app.put("/employees/:id", async (req, res) => {
  try {
    const data = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate("department");

    if (!data) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee updated successfully",
      data: data
    });

  } catch (error) {
    res.status(400).json({
      mes,
      sage: "Invalid employee data",
      error: error.message
    });
  }
});

// DELETE Employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const data = await Employee.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee deleted successfully",
      data: data
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid employee ID",
      error: error.message
    });
  }
});

 // DASHBOARD DATA

app.get("/dashboard", async (req, res) => {
  try {

    // Total employees
    const totalEmployees = await Employee.countDocuments();

    // Total departments
    const totalDepartments = await Department.countDocuments();

    // Calculate total salary
    const employees = await Employee.find();

    let totalSalary = 0;

    employees.forEach(employee => {
      totalSalary += Number(employee.salary) || 0;
    });

    res.json({
      totalEmployees,
      totalDepartments,
      totalSalary
    });

  } catch (error) {

    res.status(500).json({
      message: "Error loading dashboard",
      error: error.message
    });

  }
});


// ================================
// ATTENDANCE
// ================================


// CHECK IN

app.post("/attendance/check-in", async (req, res) => {

    try {

        const { employeeId } = req.body;

        const today = new Date().toISOString().split("T")[0];

        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: today
        });


        if (existingAttendance) {

            return res.status(400).json({
                message: "Already checked in today"
            });

        }


        const currentTime = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });


        const attendance = await Attendance.create({

            employee: employeeId,

            date: today,

            checkIn: currentTime,

            status: "Present"

        });


        res.status(201).json({

            message: "Check-in successful",

            data: attendance

        });


    } catch (error) {

        res.status(500).json({

            message: "Check-in failed",

            error: error.message

        });

    }

});


// CHECK OUT

app.put("/attendance/check-out", async (req, res) => {

    try {

        const { employeeId } = req.body;

        const today = new Date().toISOString().split("T")[0];


        const attendance = await Attendance.findOne({

            employee: employeeId,

            date: today

        });


        if (!attendance) {

            return res.status(404).json({

                message: "Please check in first"

            });

        }


        if (attendance.checkOut) {

            return res.status(400).json({

                message: "Already checked out today"

            });

        }


        const currentTime = new Date().toLocaleTimeString("en-IN", {

            hour: "2-digit",

            minute: "2-digit",

            hour12: true

        });


        attendance.checkOut = currentTime;

        await attendance.save();


        res.json({

            message: "Check-out successful",

            data: attendance

        });


    } catch (error) {

        res.status(500).json({

            message: "Check-out failed",

            error: error.message

        });

    }

});


// GET EMPLOYEE BY USERNAME
app.get("/employee-by-username/:username", async (req, res) => {
    try {
        const employee = await Employee.findOne({
            email: req.params.username
        }).populate("department");

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.json({
            data: employee
        });

    } catch (error) {
        res.status(500).json({
            message: "Error finding employee",
            error: error.message
        });
    }
});

// GET TODAY'S ATTENDANCE
app.get("/attendance/today", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const data = await Attendance.find({
            date: today
        }).populate({
            path: "employee",
            populate: {
                path: "department"
            }
        });

        res.json({
            message: "Today's attendance fetched successfully",
            data: data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error loading today's attendance",
            error: error.message
        });
    }
});


// GET ATTENDANCE FOR ONE EMPLOYEE
app.get("/attendance/:employeeId", async (req, res) => {
    try {
        const data = await Attendance.find({
            employee: req.params.employeeId
        }).populate("employee");

        res.json({
            message: "Attendance fetched successfully",
            data: data
        });

    } catch (error) {
        res.status(500).json({
            message: "Error loading attendance",
            error: error.message
        });
    }
});// SALARY SUMMARY
app.get("/salary-summary", async (req, res) => {
    try {
        const employees = await Employee.find().populate("department");

        const salaryData = [];

        for (const employee of employees) {

            const attendance = await Attendance.find({
                employee: employee._id,
                status: "Present"
            });

            const presentDays = attendance.length;
            const workingDays = 26;

            const monthlySalary = Number(employee.salary) || 0;

            const calculatedSalary =
                (monthlySalary / workingDays) * presentDays;

            salaryData.push({
                employee: employee.name,
                monthlySalary: monthlySalary,
                workingDays: workingDays,
                presentDays: presentDays,
                calculatedSalary: Math.round(calculatedSalary)
            });
        }

        res.json({
            message: "Salary summary fetched successfully",
            data: salaryData
        });

    } catch (error) {
        res.status(500).json({
            message: "Error loading salary summary",
            error: error.message
        });
    }
});



app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


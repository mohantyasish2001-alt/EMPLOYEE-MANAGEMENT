const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    date: {
        type: String,
        required: true
    },

    checkIn: {
        type: String,
        default: null
    },

    checkOut: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Present"
    }

});

module.exports = mongoose.model("Attendance", attendanceSchema);
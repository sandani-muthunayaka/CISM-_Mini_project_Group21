/**
 * Bulk Patient Assignment Script
 * Use this for initial setup or bulk assignment operations
 * 
 * Usage: node Scripts/bulkAssignPatients.js
 */

const mongoose = require('mongoose');
require('dotenv').config();
const PatientAssignment = require('../Model/patientAssignment');
const Staff = require('../Model/staff');
const Patient = require('../Model/patient');

// Assignment data structure
const assignments = [
  {
    patientId: "P001",
    staffUsername: "dr.smith",
    assignmentReason: "PRIMARY_CARE",
    accessLevel: "FULL",
    notes: "Primary physician"
  },
  {
    patientId: "P001",
    staffUsername: "nurse.jane",
    assignmentReason: "PRIMARY_CARE",
    accessLevel: "FULL",
    notes: "Primary care nurse"
  },
  {
    patientId: "P002",
    staffUsername: "dr.jones",
    assignmentReason: "PRIMARY_CARE",
    accessLevel: "FULL",
    notes: "Primary physician"
  },
];

async function bulkAssign() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Get admin user for "assignedBy" field
    const admin = await Staff.findOne({ isAdmin: true });
    if (!admin) {
      throw new Error('No admin user found. Please create an admin first.');
    }

    console.log(`\nProcessing ${assignments.length} assignments...\n`);

    for (const assignment of assignments) {
      try {
        // Verify patient exists
        const patient = await Patient.findOne({ patientId: assignment.patientId });
        if (!patient) {
          throw new Error(`Patient ${assignment.patientId} not found`);
        }

        // Verify staff exists
        const staff = await Staff.findOne({ username: assignment.staffUsername });
        if (!staff) {
          throw new Error(`Staff ${assignment.staffUsername} not found`);
        }

        // Check if assignment already exists
        const existingAssignment = await PatientAssignment.findOne({
          patientId: assignment.patientId,
          staffId: staff._id,
          status: 'ACTIVE'
        });

        if (existingAssignment) {
          console.log(`⚠️  Assignment already exists: ${assignment.staffUsername} → ${assignment.patientId}`);
          continue;
        }

        // Create assignment
        await PatientAssignment.create({
          patientId: assignment.patientId,
          staffId: staff._id,
          staffUsername: staff.username,
          staffPosition: staff.position,
          assignedBy: admin._id,
          assignedByUsername: admin.username,
          assignmentReason: assignment.assignmentReason || 'PRIMARY_CARE',
          accessLevel: assignment.accessLevel || 'FULL',
          notes: assignment.notes,
          status: 'ACTIVE'
        });

        console.log(`✅ Assigned: ${assignment.staffUsername} → ${assignment.patientId} (${assignment.assignmentReason})`);
        successCount++;

      } catch (error) {
        console.log(`❌ Error: ${assignment.staffUsername} → ${assignment.patientId}: ${error.message}`);
        errors.push({ assignment, error: error.message });
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('BULK ASSIGNMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total: ${assignments.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(({ assignment, error }) => {
        console.log(`   ${assignment.staffUsername} → ${assignment.patientId}: ${error}`);
      });
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');

  } catch (error) {
    console.error('Fatal error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
bulkAssign();

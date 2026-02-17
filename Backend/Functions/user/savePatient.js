const Patient = require('../Model/patient');

module.exports = async (req, res) => {
  try {
    const { patientId, tabs } = req.body;
    
    console.log('savePatient received:', { patientId, tabs: Object.keys(tabs || {}) });
    
    if (!patientId || !tabs) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Both patientId and tabs are required'
      });
    }

    // Check for duplicate patientId and duplicate NIC only on initial registration (tab1)
    if (tabs.tab1) {
      // Check for duplicate patientId
      const existingPatient = await Patient.findOne({ patientId });
      if (existingPatient && Object.keys(existingPatient.tab1 || {}).length > 0) {
        // Duplicate detected, send alert response
        console.log('Duplicate patient ID detected:', patientId);
        return res.status(409).json({
          error: 'Duplicate patient ID detected. This patient already exists.',
          duplicate: true,
          patient: existingPatient
        });
      }
      // Check for duplicate NIC
      const nic = tabs.tab1.nic;
      if (nic) {
        const nicPatient = await Patient.findOne({ 'tab1.nic': nic });
        if (nicPatient && Object.keys(nicPatient.tab1 || {}).length > 0) {
          console.log('Duplicate NIC detected:', nic);
          return res.status(409).json({
            error: 'Duplicate NIC detected. This NIC is already registered.',
            duplicateNic: true,
            patient: nicPatient
          });
        }
      }
    }
    
    const update = {};
    Object.keys(tabs).forEach(tabKey => {
      update[tabKey] = tabs[tabKey];
    });
    
    const patient = await Patient.findOneAndUpdate(
      { patientId },
      { $set: update },
      { upsert: true, new: true }
    );
    
    console.log('Patient saved successfully:', patientId);
    res.json(patient);
  } catch (err) {
    console.error('Error in savePatient:', err);
    res.status(500).json({ 
      error: 'Server error while saving patient',
      details: err.message 
    });
  }
};
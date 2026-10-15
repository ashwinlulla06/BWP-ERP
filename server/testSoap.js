const soap = require('soap');
const url = 'http://localhost:5000/wsdl?wsdl';
soap.createClient(url, function(err, client) {
  if (err) {
    console.error('Error creating SOAP client:', err);
    process.exit(1);
  }
  client.checkEquipmentAvailability({ equipmentId: 1, date: '2026-10-10', timeSlot: '09:00-10:00' }, function(err, result) {
    if (err) {
      console.error('SOAP call failed:', err);
      process.exit(1);
    }
    console.log('SOAP Result:', result);
    process.exit(0);
  });
});

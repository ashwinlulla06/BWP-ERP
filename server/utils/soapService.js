const soap = require('soap');
const { get } = require('../config/db');

const myService = {
  UniReserveService: {
    UniReservePort: {
      checkEquipmentAvailability: async function(args, cb) {
        const { equipmentId, date, timeSlot } = args;
        
        try {
          const equipment = await get("SELECT total_qty FROM equipment WHERE id = ?", [equipmentId]);
          if (!equipment) return cb({ Fault: { faultcode: "404", faultstring: "Equipment not found" } });
          
          const row = await get(
            `SELECT COUNT(*) AS booked 
             FROM equipment_bookings 
             WHERE equipment_id = ? AND date = ? AND time_slot = ? AND status IN ('pending', 'approved')`,
            [equipmentId, date, timeSlot]
          );
          
          const available = Math.max(equipment.total_qty - row.booked, 0);
          
          cb(null, {
            isAvailable: available > 0,
            availableQuantity: available
          });
        } catch (error) {
          cb({ Fault: { faultcode: "500", faultstring: "Internal server error" } });
        }
      }
    }
  }
};

const xml = `
<definitions name="UniReserveService"
  targetNamespace="http://www.unireserve.org/wsdl/"
  xmlns="http://schemas.xmlsoap.org/wsdl/"
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:tns="http://www.unireserve.org/wsdl/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  
  <message name="checkAvailabilityRequest">
    <part name="equipmentId" type="xsd:int"/>
    <part name="date" type="xsd:string"/>
    <part name="timeSlot" type="xsd:string"/>
  </message>
  
  <message name="checkAvailabilityResponse">
    <part name="isAvailable" type="xsd:boolean"/>
    <part name="availableQuantity" type="xsd:int"/>
  </message>
  
  <portType name="UniReservePortType">
    <operation name="checkEquipmentAvailability">
      <input message="tns:checkAvailabilityRequest"/>
      <output message="tns:checkAvailabilityResponse"/>
    </operation>
  </portType>
  
  <binding name="UniReserveBinding" type="tns:UniReservePortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="checkEquipmentAvailability">
      <soap:operation soapAction="checkEquipmentAvailability"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>
  
  <service name="UniReserveService">
    <port name="UniReservePort" binding="tns:UniReserveBinding">
      <soap:address location="http://localhost:5000/wsdl"/>
    </port>
  </service>
</definitions>
`;

function setupSoap(app) {
  soap.listen(app, '/wsdl', myService, xml);
}

module.exports = { setupSoap };

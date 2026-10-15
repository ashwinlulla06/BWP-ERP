const { generateReportHtml } = require("./utils/xsltReport");
try {
  const html = generateReportHtml([{ id: 1, type: "Equipment", resource: "Item", user: "John", date: "2026-10-10", status: "pending" }], "All Bookings");
  console.log("Success:", html);
} catch (e) {
  console.error("Caught error:", e);
}

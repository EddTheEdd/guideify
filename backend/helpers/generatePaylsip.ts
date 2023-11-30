import jsPDF from "jspdf";

export const generatePayslip = (data: any) => {
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  if (!data) {
    console.error("Invalid salary data");
    return;
  }

  const salary = data;
  const doc = new jsPDF();

  doc.setDrawColor(0); // Set color (optional)
  doc.setLineWidth(0.5); // Set line width (optional)

  // Title
  doc.setFontSize(18);
  doc.text("Payslip", 100, 20);
  // (y, x1, width, x2)
  doc.line(20, 22, 190, 22);
  // Employee and Salary Details
  doc.setFontSize(12);
  doc.text("Date: " + formatDate(salary.created_at), 20, 30);
  doc.line(20, 35, 190, 35);
  doc.text("Personal data:", 20, 36);

  doc.text(`${salary.first_name ?? ""} ${salary.last_name ?? ""}`, 20, 40);
  doc.text(`${salary.email ?? ""}`, 20, 50);
  doc.text(`Base Salary: $${salary.base_salary ?? ""}`, 20, 60);
  doc.text(`Bonus: $${salary.bonus ?? ""}`, 20, 70);
  doc.text(`Allowance: $${salary.allowance ?? ""}`, 20, 80);

  // Deductions
  doc.text("Deductions:", 20, 90);
  salary.deductibles.forEach((deductible: any, index: number) => {
    let deductionText = `${deductible.name} - `;
    deductionText += deductible.amount
      ? `$${deductible.amount}`
      : `${deductible.percentage}%`;
    doc.text(deductionText, 25, 100 + index * 10);
  });

  // Calculate Total Deductions
  let totalDeductions = salary.deductibles.reduce((total: number, ded: any) => {
    return (
      total +
      (ded.amount
        ? parseFloat(ded.amount)
        : parseFloat(salary.base_salary) * (parseFloat(ded.percentage) / 100))
    );
  }, 0);

  // Total Pay
  let totalPay =
    parseFloat(salary.base_salary) +
    parseFloat(salary.bonus) +
    parseFloat(salary.allowance) -
    totalDeductions;
  doc.text(
    `Total Deductions: $${totalDeductions.toFixed(2)}`,
    20,
    100 + salary.deductibles.length * 10 + 10
  );
  doc.text(
    `Total Pay: $${totalPay.toFixed(2)}`,
    20,
    100 + salary.deductibles.length * 10 + 20
  );

  // Save the PDF
  doc.save("payslip.pdf");
};

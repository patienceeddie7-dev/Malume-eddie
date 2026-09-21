import { CompanySettings, Loan, LoanApplication, RepaymentRecord, RepaymentScheduleItem } from '../types';

/**
 * Triggers a browser print preview formatted specifically as a formal document.
 */
export function printLoanAgreement(
  app: LoanApplication | Loan,
  settings: CompanySettings
) {
  const win = window.open('', '_blank');
  if (!win) return;

  const totalPayable = 'totalPayable' in app ? app.totalPayable : ('principal' in app ? (app as Loan).principal : 0);
  const totalInterest = 'totalInterest' in app ? app.totalInterest : 0;
  const periodVal = 'periodValue' in app ? app.periodValue : 6;
  const periodUnit = 'periodUnit' in app ? app.periodUnit : 'Months';
  const monthlyInst = 'monthlyInstallment' in app ? app.monthlyInstallment : Math.round(totalPayable / 6);
  const customerEmail = 'customerEmail' in app ? app.customerEmail : 'N/A';
  const customerPhone = 'customerPhone' in app ? app.customerPhone : 'N/A';
  const purpose = 'purpose' in app ? app.purpose : 'Personal/Business Credit';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loan Agreement - ${app.id} - ${settings.companyName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${settings.primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-area { display: flex; align-items: center; gap: 15px; }
          .logo-area img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; }
          .company-name { font-size: 24px; font-weight: bold; color: ${settings.primaryColor}; }
          .company-sub { font-size: 12px; color: #64748b; }
          .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .section { margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 14px; font-weight: bold; color: ${settings.primaryColor}; text-transform: uppercase; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; }
          .label { font-weight: 600; color: #475569; }
          .value { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; font-weight: 600; color: #334155; }
          .terms { font-size: 12px; color: #475569; line-height: 1.6; margin-top: 20px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
          .sig-box { text-align: center; width: 45%; }
          .sig-image { max-height: 60px; margin-bottom: 10px; }
          .sig-line { border-top: 1px solid #0f172a; margin-top: 40px; padding-top: 8px; font-size: 12px; font-weight: 600; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <img src="${settings.logoUrl}" alt="Logo" />
            <div>
              <div class="company-name">${settings.companyName}</div>
              <div class="company-sub">${settings.tagline}</div>
              <div class="company-sub">${settings.address} | ${settings.phone}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; font-size: 16px;">LOAN AGREEMENT</div>
            <div style="font-size: 13px; color: #64748b;">Ref: ${app.id}</div>
            <div style="font-size: 12px; color: #64748b;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="title">OFFICIAL CREDIT AGREEMENT CONTRACT</div>

        <div class="section">
          <div class="section-title">1. Borrower & Lender Details</div>
          <div class="grid">
            <div><span class="label">Borrower Name:</span> <span class="value">${app.customerName}</span></div>
            <div><span class="label">Lender:</span> <span class="value">${settings.companyName}</span></div>
            <div><span class="label">Email:</span> <span class="value">${customerEmail}</span></div>
            <div><span class="label">Contact Phone:</span> <span class="value">${customerPhone}</span></div>
            <div><span class="label">Loan Purpose:</span> <span class="value">${purpose}</span></div>
            <div><span class="label">Agreement Status:</span> <span class="value" style="font-weight:bold; color:${settings.primaryColor}">${app.status}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Principal & Interest Terms</div>
          <div class="grid">
            <div><span class="label">Loan Principal:</span> <span class="value" style="font-weight:bold;">${settings.currencySymbol || 'MWK'} ${('amount' in app ? app.amount : app.principal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            <div><span class="label">Interest Type:</span> <span class="value">${app.interestType}</span></div>
            <div><span class="label">Interest Rate:</span> <span class="value">${app.interestRate}% p.a.</span></div>
            <div><span class="label">Total Interest Charged:</span> <span class="value">${settings.currencySymbol || 'MWK'} ${totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            <div><span class="label">Repayment Tenure:</span> <span class="value">${periodVal} ${periodUnit}</span></div>
            <div><span class="label">Total Amount Payable:</span> <span class="value" style="font-weight:bold; color:${settings.primaryColor}">${settings.currencySymbol || 'MWK'} ${totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Borrower Photo & Collateral Verification</div>
          <div style="display: flex; gap: 20px; align-items: flex-start; font-size: 13px;">
            ${app.clientPhotoUrl ? `
              <div style="text-align: center; border: 1px solid #cbd5e1; padding: 8px; border-radius: 8px; background: white;">
                <img src="${app.clientPhotoUrl}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px;" alt="Borrower Photo" />
                <div style="font-size: 11px; font-weight: bold; margin-top: 4px; color: #334155;">Client Photo</div>
              </div>
            ` : ''}
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 6px;">
                <span style="color: #475569;">Collateral Item Name:</span> ${app.collateralName || 'Declared Collateral Asset'}
              </div>
              ${app.collateralPhotoUrl ? `
                <div style="margin-top: 8px;">
                  <img src="${app.collateralPhotoUrl}" style="max-width: 260px; max-height: 150px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" alt="Collateral Photo" />
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600;">Verified Collateral Asset Photo</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. Repayment Obligation</div>
          <p class="terms">
            The Borrower agrees to pay the Lender the total sum of <strong>${settings.currencySymbol || 'MWK'} ${totalPayable.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> in equal monthly installments of <strong>${settings.currencySymbol || 'MWK'} ${monthlyInst.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>.
            Overdue payments shall accrue a penalty fee of <strong>${settings.currencySymbol || 'MWK'} ${settings.defaultPenaltyValue.toLocaleString()} (${settings.defaultPenaltyType})</strong> after a grace period of ${settings.gracePeriodDays} days.
          </p>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">BORROWER ELECTRONIC SIGNATURE</div>
            ${app.signatureUrl ? `<img class="sig-image" src="${app.signatureUrl}" alt="Signature" />` : '<div style="height:50px;"></div>'}
            <div class="sig-line">${app.customerName} (Signed Digitally)</div>
          </div>
          <div class="sig-box">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 5px;">FOR AND ON BEHALF OF LENDER</div>
            <div style="height:40px; font-weight:bold; font-family:cursive; font-size:20px; color:${settings.primaryColor}; display:flex; align-items:center; justify-content:center;">${settings.companyName}</div>
            <div class="sig-line">Authorized Credit Officer, ${settings.companyName}</div>
          </div>
        </div>

        <div class="footer">
          This document is generated by ${settings.companyName} secure cloud platform. Digitally signed and legally binding. ${settings.website}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

/**
 * Generates official repayment receipt printable document.
 */
export function printRepaymentReceipt(record: RepaymentRecord, loan: Loan | null, settings: CompanySettings) {
  const win = window.open('', '_blank');
  if (!win) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Receipt - ${record.id} - ${settings.companyName}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 30px; margin: 0; max-width: 600px; margin: 0 auto; }
          .receipt-card { border: 2px solid ${settings.primaryColor}; padding: 25px; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .company { font-size: 22px; font-weight: bold; color: ${settings.primaryColor}; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .amount-banner { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .amount-val { font-size: 28px; font-weight: bold; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; margin-bottom: 20px; }
          .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
          .value { color: #0f172a; font-weight: 500; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div class="company">${settings.companyName}</div>
            <div class="sub">Official Repayment Receipt</div>
            <div class="sub">Receipt Ref: ${record.id} | Date: ${record.date}</div>
          </div>

          <div class="amount-banner">
            <div style="font-size: 12px; text-transform: uppercase;">Payment Received</div>
            <div class="amount-val">${settings.currencySymbol || 'MWK'} ${record.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <div style="font-size: 12px; margin-top: 4px;">Status: SUCCESSFUL</div>
          </div>

          <div class="grid">
            <div>
              <div class="label">Customer Name</div>
              <div class="value">${record.customerName}</div>
            </div>
            <div>
              <div class="label">Loan Account</div>
              <div class="value">${record.loanId}</div>
            </div>
            <div>
              <div class="label">Payment Method</div>
              <div class="value">${record.paymentMethod}</div>
            </div>
            <div>
              <div class="label">Transaction Reference</div>
              <div class="value">${record.transactionRef}</div>
            </div>
            ${loan ? `
              <div>
                <div class="label">Total Paid to Date</div>
                <div class="value">${settings.currencySymbol || 'MWK'} ${loan.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div>
                <div class="label">Remaining Balance</div>
                <div class="value" style="font-weight:bold; color:${settings.primaryColor}">${settings.currencySymbol || 'MWK'} ${loan.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            Thank you for choosing ${settings.companyName}. For support, call ${settings.phone} or visit ${settings.website}
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

// File Path: src/app/api/mpesa/callback/route.js
import { connectDB } from "@/lib/dbConnect";
import { sendInvoiceEmail } from "@/lib/email";
import Contribution from "@/models/Contribution";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import Chama from "@/models/Chama";
import { logAuditEvent } from "@/lib/auditLog";
import Transaction from "@/models/Transaction";
import Loan from "@/models/Loan";

// Helper function to handle successful contribution logic
async function handleSuccessfulContribution(contribution, amount, receipt, phone, date) {
    contribution.status = "confirmed";
    contribution.mpesaReceiptNumber = receipt;
    contribution.transactionDate = date;
    contribution.phoneNumber = phone;
    contribution.amount = amount;
    await contribution.save();

    await logAuditEvent({
        chamaId: contribution.chamaId,
        userId: contribution.userId,
        action: 'MPESA_CONTRIBUTION_SUCCESS',
        category: 'CONTRIBUTION',
        amount: amount,
        description: `M-Pesa contribution successful. Receipt: ${receipt}`,
        after: contribution.toObject()
    });

    if (contribution.chamaId && amount > 0) {
        await Chama.findByIdAndUpdate(contribution.chamaId, {
            $inc: { currentBalance: amount, totalContributions: amount }
        });
    }

    try {
        const user = await User.findById(contribution.userId);
        if (user) {
            const newInvoice = await Invoice.create({
                userId: contribution.userId,
                contributionId: contribution._id,
                invoiceNumber: `INV-${receipt}`,
                amount: amount,
                status: "paid",
            });
            await sendInvoiceEmail({ to: user.email, invoice: newInvoice });
        }
    } catch (error) {
        console.error("Error creating invoice or sending email:", error);
    }
}

// Helper function to handle successful loan repayment logic
async function handleSuccessfulLoanRepayment(transaction, amount, receipt) {
    transaction.status = "completed"; // Assuming 'completed' is the success status
    transaction.mpesaReceiptNumber = receipt; // Add receipt if schema supports it
    await transaction.save();

    const loan = await Loan.findById(transaction.referenceId);
    if (!loan) {
        console.error(`CRITICAL: Loan not found for transaction ${transaction._id}`);
        return;
    }

    // Calculate new totals safely
    const totalOwed = (loan.totalExpectedRepayment || loan.amount) + (loan.penaltyAmount || 0);
    const newTotalPaid = (loan.totalPaid || 0) + amount;
    const newStatus = newTotalPaid >= totalOwed ? 'repaid' : 'active';

    // Use findByIdAndUpdate to bypass strict document validation on older missing fields
    const updatedLoan = await Loan.findByIdAndUpdate(
        loan._id,
        {
            totalPaid: newTotalPaid,
            status: newStatus
        },
        { new: true } // Return the updated document
    );

    await logAuditEvent({
        chamaId: updatedLoan.chamaId,
        userId: transaction.userId,
        action: 'LOAN_REPAYMENT_SUCCESS',
        category: 'LOAN',
        amount: amount,
        description: `Loan repayment of ${amount} successful via M-Pesa. Receipt: ${receipt}`,
        after: updatedLoan.toObject()
    });
    
    // Also increase the chama's main balance
    if (updatedLoan.chamaId && amount > 0) {
        await Chama.findByIdAndUpdate(updatedLoan.chamaId, {
            $inc: { currentBalance: amount }
        });
    }
}

export async function POST(request) {
  await connectDB();
  try {
    const callbackData = await request.json();
    const { Body } = callbackData;

    if (!Body?.stkCallback) {
      return new Response(JSON.stringify({ error: "Invalid callback format" }), { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    // Try to find a contribution OR a loan transaction
    const contribution = await Contribution.findOne({ checkoutRequestId: CheckoutRequestID });
    const loanTransaction = await Transaction.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!contribution && !loanTransaction) {
      console.error(`No record found for CheckoutRequestID: ${CheckoutRequestID}`);
      await logAuditEvent({
          action: 'MPESA_CALLBACK_UNKNOWN_ID',
          category: 'PAYMENT',
          description: `M-Pesa callback received for an unknown CheckoutRequestID: ${CheckoutRequestID}.`,
      });
      return new Response(JSON.stringify({ error: "Transaction record not found" }), { status: 404 });
    }

    const metadata = CallbackMetadata?.Item || [];
    const amount = parseFloat(metadata.find((i) => i.Name === "Amount")?.Value || 0);
    const receipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
    const date = metadata.find((i) => i.Name === "TransactionDate")?.Value;

    if (ResultCode === 0) { // Payment was successful
      if (contribution) {
        await handleSuccessfulContribution(contribution, amount, receipt, phone, date);
      } else if (loanTransaction) {
        await handleSuccessfulLoanRepayment(loanTransaction, amount, receipt);
      }
    } else { // Payment failed
      const failureData = {
        status: 'failed',
        failureReason: ResultDesc
      };
      
      const record = contribution || loanTransaction;
      const logDetails = {
          chamaId: record.chamaId,
          userId: record.userId,
          action: contribution ? 'MPESA_CONTRIBUTION_FAILURE' : 'LOAN_REPAYMENT_FAILURE',
          category: contribution ? 'CONTRIBUTION' : 'LOAN',
          description: `M-Pesa payment failed. Reason: ${ResultDesc}`,
          after: record.toObject()
      };
      
      await record.updateOne(failureData);
      await logAuditEvent(logDetails);
    }

    return new Response(JSON.stringify({ message: "Callback processed successfully" }), { status: 200 });

  } catch (error) {
    console.error("Callback Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
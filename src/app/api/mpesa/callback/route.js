// File Path: src/app/api/mpesa/callback/route.js
import { connectDB } from "@/lib/dbConnect";
import { sendInvoiceEmail } from "@/lib/email";
import Contribution from "@/models/Contribution";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import Chama from "@/models/Chama";

export async function POST(request) {
  await connectDB();
  try {
    const callbackData = await request.json();
    const { Body } = callbackData;

    if (!Body?.stkCallback) {
      console.error("Invalid callback format received.");
      return new Response(JSON.stringify({ error: "Invalid callback format" }), { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    const contribution = await Contribution.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!contribution) {
      console.error(`Contribution not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return new Response(JSON.stringify({ error: "Contribution not found" }), { status: 404 });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      const amount = parseFloat(metadata.find((i) => i.Name === "Amount")?.Value || 0);
      const receipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
      const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
      const date = metadata.find((i) => i.Name === "TransactionDate")?.Value;

      contribution.status = "confirmed";
      contribution.mpesaReceiptNumber = receipt;
      contribution.transactionDate = date;
      contribution.phoneNumber = phone;
      contribution.amount = amount;
      await contribution.save();

      // --- ROBUSTNESS FIX: Ensure chamaId exists before updating the balance ---
      if (contribution.chamaId && amount > 0) {
        await Chama.findByIdAndUpdate(contribution.chamaId, {
          $inc: { currentBalance: amount } // Use the parsed amount
        });
        console.log(`Successfully updated balance for Chama ID: ${contribution.chamaId}`);
      } else {
        console.error(`CRITICAL: Contribution ${contribution._id} was confirmed but is missing a chamaId. Balance not updated.`);
      }
      // --- END OF FIX ---

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
    } else {
      contribution.status = "failed";
      contribution.failureReason = ResultDesc;
      await contribution.save();
    }

    return new Response(JSON.stringify({ message: "Callback processed" }), { status: 200 });
  } catch (error) {
    console.error("Callback Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}


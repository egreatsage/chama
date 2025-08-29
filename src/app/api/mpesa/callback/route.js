import { connectDB } from "@/lib/dbConnect";
import { sendInvoiceEmail } from "@/lib/email";
import Contribution from "@/models/Contribution";
import Invoice from "@/models/Invoice";
import User from "@/models/User";

export async function POST(request) {
  await connectDB();

  try {
    const callbackData = await request.json();
    

    const { Body } = callbackData;
    if (!Body?.stkCallback) {
      return new Response(JSON.stringify({ error: "Invalid callback format" }), { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    const contribution = await Contribution.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!contribution) {
      return new Response(JSON.stringify({ error: "Contribution not found" }), { status: 404 });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      
      const amount = metadata.find((i) => i.Name === "Amount")?.Value;
      const receipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
      const phone = metadata.find((i) => i.Name === "PhoneNumber")?.Value;
      const date = metadata.find((i) => i.Name === "TransactionDate")?.Value;

      contribution.status = "confirmed";
      contribution.mpesaReceiptNumber = receipt;
      contribution.transactionDate = date;
      contribution.phoneNumber = phone;
      contribution.amount = amount;
      await contribution.save();

      try {
        const user = await User.findById(contribution.userId);
        if (user) {
          const newInvoice = await Invoice.create({
            userId:contribution.userId,
            contributionId:contribution._id,
            invoiceNumber:`INV-${contribution.mpesaReceiptNumber}`,
            amount:contribution.amount,
            status:"paid",
          })
          await sendInvoiceEmail({ to: user.email, invoice: newInvoice });
        }
      } catch (error) {
        console.error("Error sending invoice email:", error);
      }
    } else {
      // Payment failed
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

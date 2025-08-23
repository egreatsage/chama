import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";

export async function POST(request) {
  await connectDB();

  try {
    const callbackData = await request.json();
    console.log("STK Callback:", JSON.stringify(callbackData, null, 2));

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

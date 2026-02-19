// src/app/api/mpesa/stkpush/route.js
import { NextResponse } from 'next/server';
import { getAccessToken, getTimestamp } from "@/lib/mpesa";
import axios from "axios";
import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import Transaction from "@/models/Transaction"; // Make sure to import Transaction
import { getServerSideUser } from "@/lib/auth"; 

export async function POST(request) {
  try {
    await connectDB();

    // Authenticate using the universal helper
    const user = await getServerSideUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    console.log("Received STK Push Request Body:", body);
    
    // NEW: Extract paymentType and loanId. Default paymentType to 'contribution'
    const { phoneNumber, amount, chamaId, paymentType = 'contribution', loanId } = body;
    
    if (!phoneNumber || !amount || !chamaId || typeof chamaId !== 'string' || chamaId.trim() === '') {
      return NextResponse.json({ error: "Missing required fields (phoneNumber, amount, chamaId)" }, { status: 400 });
    }

    // NEW: Validation for loan payments
    if (paymentType === 'loan_repayment' && !loanId) {
      return NextResponse.json({ error: "loanId is required for loan repayments" }, { status: 400 });
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("0")) {
      formattedPhone = `254${phoneNumber.slice(1)}`;
    } else if (phoneNumber.startsWith("+254")) {
      formattedPhone = phoneNumber.slice(1);
    }

    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json({ error: "Invalid Safaricom number" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.NEXT_PUBLIC_CALLBACK_URL; // e.g., https://yourdomain.com/api/mpesa/callback

    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    // Dynamic descriptions for the M-Pesa prompt
    const accountRef = paymentType === 'loan_repayment' ? "Loan Repayment" : "Chama Contribution";
    const transDesc = paymentType === 'loan_repayment' ? `Paying loan ${loanId.slice(-4)}` : "Member contribution";

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure amount is an integer
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: accountRef, 
      TransactionDesc: transDesc, 
    };

    // Trigger STK Push
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const checkoutRequestId = response.data.CheckoutRequestID;

    // NEW: Route the database save based on the payment type
    if (paymentType === 'loan_repayment') {
      // Record a pending Loan Repayment
      await Transaction.create({
        type: "loan_repayment",
        referenceId: loanId, 
        userId,
        chamaId, // Add chamaId
        amount,
        status: "pending",
        checkoutRequestId: checkoutRequestId,
        phoneNumber: formattedPhone, // Add phoneNumber
        paymentMethod: "mpesa",
      });
    } else {
      // Record a pending Contribution (Original logic)
      await Contribution.create({
        chamaId,
        userId,
        amount,
        status: "pending",
        checkoutRequestId: checkoutRequestId,
        phoneNumber: formattedPhone,
        paymentMethod: "mpesa",
      });
    }

    return NextResponse.json(response.data, { status: 200 });

  } catch (error) {
    console.error("STK Push Error:", error?.response?.data || error.message);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
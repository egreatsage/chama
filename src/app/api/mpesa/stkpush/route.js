import { NextResponse } from 'next/server';
import { getAccessToken, getTimestamp } from "@/lib/mpesa";
import axios from "axios";
import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import { getServerSideUser } from "@/lib/auth"; // Use the helper!

export async function POST(request) {
  try {
    await connectDB();

    // authenticate using the universal helper (Works for Google AND Email login)
    const user = await getServerSideUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const userId = user.id; // derived safely from helper

    const body = await request.json();
    console.log("Received STK Push Request Body:", body);
    const { phoneNumber, amount, chamaId } = body;
    
    if (!phoneNumber || !amount || !chamaId || typeof chamaId !== 'string' || chamaId.trim() === '') {
      return new Response(JSON.stringify({ error: "Missing required fields (phoneNumber, amount, chamaId)" }), { status: 400 });
    }

    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith("0")) {
      formattedPhone = `254${phoneNumber.slice(1)}`;
    } else if (phoneNumber.startsWith("+254")) {
      formattedPhone = phoneNumber.slice(1);
    }

    if (!/^254\d{9}$/.test(formattedPhone)) {
      return new Response(JSON.stringify({ error: "Invalid Safaricom number" }), { status: 400 });
    }

    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.NEXT_PUBLIC_CALLBACK_URL;

    const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: "Chama Contribution",
      TransactionDesc: "Member contribution",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    await Contribution.create({
      chamaId,
      userId,
      amount,
      status: "pending",
      checkoutRequestId: response.data.CheckoutRequestID,
      phoneNumber: phoneNumber,
      paymentMethod: "mpesa",
    });

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("STK Push Error:", error.message);
    return new Response(JSON.stringify({ error: "Failed to initiate payment" }), { status: 500 });
  }
}
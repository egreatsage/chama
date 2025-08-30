// File Path: src/app/api/mpesa/stkpush/route.js
import { cookies } from "next/headers";
import { getAccessToken, getTimestamp } from "@/lib/mpesa";
import axios from "axios";
import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const userId = decoded.userId;

    // --- ENHANCED DEBUGGING: Log the entire request body ---
    const body = await request.json();
    console.log("Received STK Push Request Body:", body);
    const { phoneNumber, amount, chamaId } = body;
    
    // --- More Robust Check ---
    if (!phoneNumber || !amount || !chamaId || typeof chamaId !== 'string' || chamaId.trim() === '') {
      console.error("Validation Error: Missing or invalid fields.", { phoneNumber, amount, chamaId });
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

    // --- FIX: Include chamaId when creating the contribution ---
    await Contribution.create({
      chamaId, // Add this line
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


// src/app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import Chama from "@/models/Chama";
import Contribution from "@/models/Contribution";
import { getServerSideUser } from '@/lib/auth';

const isSystemAdmin = (user) => user && user.role === 'admin';

export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user || !isSystemAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. User Stats
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfToday } });
    
    // 2. Chama Stats
    const totalChamas = await Chama.countDocuments();
    const activeChamas = await Chama.countDocuments({ status: 'active' });
    const dormantChamas = totalChamas - activeChamas;

    // 3. Financial Flow (Confirmed Contributions)
    // Current Month
    const currentMonthStats = await Contribution.aggregate([
      { 
        $match: { 
          status: 'confirmed', 
          createdAt: { $gte: startOfMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Last Month
    const lastMonthStats = await Contribution.aggregate([
      { 
        $match: { 
          status: 'confirmed', 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentMonthVolume = currentMonthStats[0]?.total || 0;
    const lastMonthVolume = lastMonthStats[0]?.total || 0;

    // 4. System Health (Mock Check)
    // In a real scenario, you might ping the MPesa URL or check your DB connection pool
    const systemHealth = {
      mpesa: process.env.MPESA_CONSUMER_KEY ? 'Online' : 'Config Missing',
      database: 'Connected'
    };

    return NextResponse.json({
      users: { total: totalUsers, newToday: newUsersToday },
      chamas: { total: totalChamas, active: activeChamas, dormant: dormantChamas },
      financials: { currentMonth: currentMonthVolume, lastMonth: lastMonthVolume },
      system: systemHealth
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
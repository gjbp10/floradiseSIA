import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

// Helper function to get the start of the current month in milliseconds
const getStartOfMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfMonth.getTime();
};

const getOverviewAnalytics = async (req, res) => {
    try {
        const startOfMonthTimestamp = getStartOfMonth();

        // --- 1. Fetch Total & Monthly Revenue/Orders ---
        const [
            totalRevenueResult, 
            totalOrdersResult, 
            monthlyRevenueResult
        ] = await Promise.all([
            // Total Revenue
            orderModel.aggregate([
                { $match: { payment: true } }, 
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]),
            // Total Orders Count
            orderModel.countDocuments({}), 
            // Current Month Revenue
            orderModel.aggregate([
                { $match: { payment: true, date: { $gte: startOfMonthTimestamp } } },
                { $group: { _id: null, currentMonthRevenue: { $sum: '$amount' } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
        const totalOrders = totalOrdersResult;
        const currentMonthRevenue = monthlyRevenueResult[0]?.currentMonthRevenue || 0;

        // --- 2. Customer Metrics ---
        const [totalCustomersResult, newCustomersThisMonthResult] = await Promise.all([
            userModel.countDocuments({}),
            userModel.countDocuments({ createdAt: { $gte: new Date(startOfMonthTimestamp) } })
        ]);

        const totalCustomers = totalCustomersResult;
        const newCustomersThisMonth = newCustomersThisMonthResult;

        // --- 3. Top Products Aggregation (SAFE VERSION) ---
        // We will stick to the safer field names that are most likely correct.
        // If this still fails, the field names for price/quantity MUST be wrong.
        const topProducts = await orderModel.aggregate([
            { $match: { payment: true } },
            { $unwind: '$items' }, 
            {
                $group: {
                    // Use a common ID field and the 'name' field
                    _id: { 
                        id: '$items.id', // Using common 'id' field
                        productId: '$items.productId' // Including 'productId' as a fallback
                    }, 
                    productName: { $first: '$items.name' }, 
                    // Use common quantity fields for calculation
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } 
                }
            },
            { $sort: { revenue: -1 } }, 
            { $limit: 5 } 
        ]);
        
        // --- Final Success Response ---
        const responseData = {
            totalRevenue,
            totalOrders,
            currentMonthRevenue,
            totalCustomers,
            newCustomersThisMonth,
            topProducts,
        };
        
        // 🌟 FINAL DEBUGGING LOG: Check the data payload right before sending 🌟
        console.log("Analytics Data Ready. Revenue:", totalRevenue); 
        
        res.json({
            success: true,
            data: responseData
        });

    } catch (error) {
        // --- Critical Error Handler ---
        console.error("CRITICAL SERVER CRASH IN ANALYTICS:", error.stack || error); 
        
        res.status(500).json({
            success: false,
            message: "Internal Server Error. Please check backend console for detailed MongoDB error."
        });
    }
};

export { getOverviewAnalytics };

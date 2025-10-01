"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { backendUrl } from "../App" 

// Helper function for currency formatting
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

const SalesAnalytics = ({ token }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            // 🌟 DEBUGGING STEP 3: Log the URL to verify it's correct 🌟
            console.log("Fetching Analytics from:", backendUrl + "/api/analytics/overview");
            
            const response = await axios.get(backendUrl + "/api/analytics/overview", {
                headers: { token },
            });

            if (response.data.success) {
                setAnalyticsData(response.data.data);
            } else {
                // Backend returned success: false (e.g., failed DB query, caught server-side)
                toast.error("Failed to fetch analytics: " + response.data.message);
            }
        } catch (error) {
            // 🌟 DEBUGGING STEP 4: Log the full error object for status code (401/500) 🌟
            console.error("Axios Fetch Error:", error.message, error.response?.status);

            // Give a more informative toast message based on common status codes
            const status = error.response?.status;
            let errorMessage = "Error fetching analytics data.";

            if (status === 401 || status === 403) {
                errorMessage = "Authentication Failed. Please check your admin token.";
            } else if (status === 500) {
                errorMessage = "Server Crash (500). Check backend terminal for specific database error.";
            } else if (status === 404) {
                errorMessage = "API Not Found (404). Check backend route setup.";
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // 🌟 DEBUGGING STEP 1: Check if the token is present before fetching 🌟
        if (!token) {
            console.warn("Analytics fetch aborted: Token is null or undefined.");
            setIsLoading(false);
            toast.error("Authentication token required for analytics access.");
            return;
        }

        // 🌟 DEBUGGING STEP 2: Log the token used (but be careful not to expose it in production logs) 🌟
        console.log("Initiating Analytics Fetch with token:", token.substring(0, 10) + '...');
        
        fetchAnalytics();
    }, [token]);

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Loading Analytics...</div>;
    }
    
    // Fallback if data is null after loading
    if (!analyticsData) {
        return <div className="p-4 text-center text-red-500">No analytics data available or failed to load.</div>;
    }

    const { totalRevenue, totalOrders, currentMonthRevenue, totalCustomers, newCustomersThisMonth, topProducts } = analyticsData;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales & Analytics Reports 📊</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Total Revenue Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
                    <p className="text-sm text-gray-500 uppercase">Total Revenue (All Time)</p>
                    <p className="text-3xl font-extrabold mt-1 text-indigo-700">{formatCurrency(totalRevenue)}</p>
                </div>

                {/* 2. Monthly Revenue Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
                    <p className="text-sm text-gray-500 uppercase">Revenue This Month</p>
                    <p className="text-3xl font-extrabold mt-1 text-green-700">{formatCurrency(currentMonthRevenue)}</p>
                </div>

                {/* 3. Total Orders Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
                    <p className="text-sm text-gray-500 uppercase">Total Orders</p>
                    <p className="text-3xl font-extrabold mt-1 text-yellow-700">{totalOrders.toLocaleString()}</p>
                </div>
            </div>

            {/* --- Product Performance & Customer Insights --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Product Performance Report */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Top 5 Product Performance</h2>
                    {topProducts.length > 0 ? (
                        <ol className="space-y-3">
                            {topProducts.map((product, index) => (
                                <li key={index} className="flex justify-between items-center text-sm border-l-4 border-blue-400 pl-3 py-1 bg-blue-50">
                                    <span className="font-medium">{index + 1}. {product.productName || "Unknown Product"}</span>
                                    <span className="font-bold text-blue-700">{formatCurrency(product.revenue)}</span>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-gray-500">No product sales recorded yet.</p>
                    )}
                </div>

                {/* Customer Insights Report */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Customer Insights</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 border rounded-lg bg-purple-50">
                            <span className="text-gray-600 font-medium">Total Registered Customers</span>
                            <span className="text-2xl font-bold text-purple-700">{totalCustomers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg bg-pink-50">
                            <span className="text-gray-600 font-medium">New Customers (This Month)</span>
                            <span className="text-2xl font-bold text-pink-700">{newCustomersThisMonth.toLocaleString()}</span>
                        </div>
                        {/* Placeholder for more advanced metrics like CLV or Churn Rate */}
                        <div className="p-3 text-center border rounded-lg border-dashed text-gray-500">
                            Need charts for Customer Lifetime Value (CLV) and retention rates.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;

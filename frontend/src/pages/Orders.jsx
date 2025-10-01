import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import RatingPopup from "../components/RatingPopup";

const Orders = () => {
    const { backendUrl, token, currency } = useContext(ShopContext);
    const [orderData, setorderData] = useState([]);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadOrderData = async () => {
        try {
            if (!token) {
                return null;
            }

            const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
            if (response.data.success) {
                let allOrdersItem = [];
                response.data.orders.map((order) => {
                    order.items.map((item) => {
                        item['status'] = order.status;
                        item['payment'] = order.payment;
                        item['paymentMethod'] = order.method; // Fixed the mapping to ensure we use 'order.method'
                        item['date'] = order.date;
                        allOrdersItem.push(item);
                    });
                });
                setorderData(allOrdersItem.reverse());
            }

        } catch (error) {
            console.error("Error loading order data:", error);
        }
    };

    useEffect(() => {
        loadOrderData();
    }, [token]);

    const handleRateProduct = (product) => {
        setSelectedProduct(product);
        setIsRatingModalOpen(true);
    };
    
    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setSelectedProduct(null);
    };

    // This function can be used to handle a successful review submission from the popup
    const handleReviewSubmit = (reviewData) => {
        console.log('Review submitted successfully:', reviewData);
    };

    const getPaymentMethodDisplay = (method) => {
        if (!method) return 'Stripe';
        return method.toUpperCase();
    }

    return (
        <div className='border-t pt-16'>
            <div className='text-2xl'>
                <Title text1={'MY'} text2={'ORDERS'} />
            </div>
            <div>
                {
                    orderData.map((item, index) => (
                        <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                            <div className='flex items-start gap-6 text-sm'>
                                <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                                <div>
                                    <p className='sm:text-base font-medium'>{item.name}</p>
                                    <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                                        <p>{currency}{item.price}</p>
                                        <p>Quantity: {item.quantity}</p>
                                       
                                    </div>
                                    <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                                    <p className='mt-1'>Payment: <span className='font-medium' style={{ color: item.payment ? 'green' : 'red' }}>
                                        {item.payment ? 'Paid' : 'Unpaid'} ({getPaymentMethodDisplay(item.paymentMethod)}) {/* ⬅️ Displays the method */}
                                    </span></p>
                                </div>
                            </div>
                            <div className='md:w-1/2 flex justify-between gap-2'>
                                <div className='flex items-center gap-2'>
                                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                    <p className='text-sm md:text-base'>{item.status}</p>
                                </div>
                                <div className='flex gap-2'>
                                    <button onClick={() => handleRateProduct(item)} className='bg-pink-500 text-white px-4 py-2 text-sm font-medium rounded-sm'>Rate Product</button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            
            {/* Conditionally render the RatingPopup component */}
            {isRatingModalOpen && selectedProduct && (
                <RatingPopup
                    product={selectedProduct}
                    onClose={handleCloseRatingModal}
                    onReviewSubmit={handleReviewSubmit}
                />
            )}
        </div>
    );
};

export default Orders;

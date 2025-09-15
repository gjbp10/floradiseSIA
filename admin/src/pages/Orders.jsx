import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrderData, setEditedOrderData] = useState({});

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  const handleEdit = (order) => {
    setEditingOrderId(order._id);
    setEditedOrderData({ ...order });
  };

  const handleInputChange = (event, field) => {
    setEditedOrderData({
      ...editedOrderData,
      [field]: event.target.value,
    });
  };

  const handleItemChange = (event, itemIndex, field) => {
    const updatedItems = editedOrderData.items.map((item, index) =>
      index === itemIndex ? { ...item, [field]: event.target.value } : item
    );
    setEditedOrderData({ ...editedOrderData, items: updatedItems });
  };

  const handleAddressChange = (event, field) => {
    setEditedOrderData({
      ...editedOrderData,
      address: { ...editedOrderData.address, [field]: event.target.value },
    });
  };

  const saveChanges = async () => {
    try {
      const response = await axios.put(
        backendUrl + `/api/order/${editingOrderId}`,
        editedOrderData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Order updated successfully!');
        await fetchAllOrders();
        setEditingOrderId(null);
        setEditedOrderData({});
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditedOrderData({});
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_auto] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_auto] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              {editingOrderId === order._id ? (
                <div>
                  {editedOrderData.items &&
                    editedOrderData.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="py-0.5 flex items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(e, itemIndex, 'name')}
                          className="w-1/2 mr-1 border rounded p-1 text-xs"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(e, itemIndex, 'quantity')}
                          className="w-1/4 mr-1 border rounded p-1 text-xs"
                        />
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => handleItemChange(e, itemIndex, 'size')}
                          className="w-1/4 border rounded p-1 text-xs"
                        />
                        {itemIndex < editedOrderData.items.length - 1 && <span className="ml-1">,</span>}
                      </div>
                    ))}
                  <div className="mt-3 mb-2 font-medium">
                    <input
                      type="text"
                      value={editedOrderData.address?.firstName}
                      onChange={(e) => handleAddressChange(e, 'firstName')}
                      placeholder="First Name"
                      className="w-1/2 mr-1 border rounded p-1 text-xs"
                    />
                    <input
                      type="text"
                      value={editedOrderData.address?.lastName}
                      onChange={(e) => handleAddressChange(e, 'lastName')}
                      placeholder="Last Name"
                      className="w-1/2 border rounded p-1 text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editedOrderData.address?.street}
                      onChange={(e) => handleAddressChange(e, 'street')}
                      placeholder="Street"
                      className="w-full border rounded p-1 text-xs mb-1"
                    />
                    <div className="flex">
                      <input
                        type="text"
                        value={editedOrderData.address?.city}
                        onChange={(e) => handleAddressChange(e, 'city')}
                        placeholder="City"
                        className="w-1/2 mr-1 border rounded p-1 text-xs"
                      />
                      <input
                        type="text"
                        value={editedOrderData.address?.state}
                        onChange={(e) => handleAddressChange(e, 'state')}
                        placeholder="State"
                        className="w-1/4 mr-1 border rounded p-1 text-xs"
                      />
                      <input
                        type="text"
                        value={editedOrderData.address?.country}
                        onChange={(e) => handleAddressChange(e, 'country')}
                        placeholder="Country"
                        className="w-1/4 border rounded p-1 text-xs"
                      />
                    </div>
                    <input
                      type="text"
                      value={editedOrderData.address?.zipcode}
                      onChange={(e) => handleAddressChange(e, 'zipcode')}
                      placeholder="Zipcode"
                      className="w-1/2 mt-1 border rounded p-1 text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    value={editedOrderData.address?.phone}
                    onChange={(e) => handleAddressChange(e, 'phone')}
                    placeholder="Phone"
                    className="w-1/2 mt-1 border rounded p-1 text-xs"
                  />
                </div>
              ) : (
                <div>
                  <div>
                    {order.items.map((item, index) => (
                      index === order.items.length - 1 ? (
                        <p className="py-0.5" key={index}>
                          {item.name} x {item.quantity} <span> {item.size} </span>
                        </p>
                      ) : (
                        <p className="py-0.5" key={index}>
                          {item.name} x {item.quantity} <span> {item.size} </span> ,
                        </p>
                      )
                    ))}
                  </div>
                  <p className="mt-3 mb-2 font-medium">{order.address.firstName + ' ' + order.address.lastName}</p>
                  <div>
                    <p>{order.address.street + ','}</p>
                    <p>
                      {order.address.city +
                        ', ' +
                        order.address.state +
                        ', ' +
                        order.address.country +
                        ', ' +
                        order.address.zipcode}
                    </p>
                  </div>
                  <p>{order.address.phone}</p>
                </div>
              )}
            </div>
            <div>
              {editingOrderId === order._id ? (
                <div>
                  <label className="block text-gray-700 text-xs font-bold mb-2">Items:</label>
                  <input
                    type="number"
                    value={editedOrderData.items?.length}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  />
                  <label className="block text-gray-700 text-xs font-bold mt-3 mb-2">Method:</label>
                  <input
                    type="text"
                    value={editedOrderData.paymentMethod}
                    onChange={(e) => handleInputChange(e, 'paymentMethod')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  />
                  <label className="block text-gray-700 text-xs font-bold mt-3 mb-2">Payment:</label>
                  <select
                    value={editedOrderData.payment ? 'Done' : 'Pending'}
                    onChange={(e) => handleInputChange(e, 'payment')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <label className="block text-gray-700 text-xs font-bold mt-3 mb-2">Date:</label>
                  <input
                    type="date"
                    value={new Date(editedOrderData.date).toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange(e, 'date')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-xs"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-sm sm:text-[15px]">Items : {order.items.length}</p>
                  <p className="mt-3">Method : {order.paymentMethod}</p>
                  <p>Payment : {order.payment ? 'Done' : 'Pending'}</p>
                  <p>Date : {new Date(order.date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-[15px]">{currency}{order.amount}</p>
            <div className="flex flex-col items-start">
              {editingOrderId === order._id ? (
                <div className="flex">
                  <button onClick={saveChanges} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 text-xs">
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-xs">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(order)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-2 text-xs"
                >
                  Edit
                </button>
              )}
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold text-xs"
                disabled={editingOrderId === order._id}
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
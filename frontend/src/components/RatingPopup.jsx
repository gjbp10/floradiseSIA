import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Title from './Title'; // Assuming Title component is in the same directory

const RatingPopup = ({ product, onClose, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage('Please select a rating before submitting.');
            return;
        }

        setIsSubmitting(true);
        setMessage('Submitting your review...');

        // Here you would make an API call to your backend
        // to save the rating and review text.
        // Example:
        // axios.post('/api/review', {
        //     productId: product._id,
        //     rating,
        //     reviewText
        // }).then(response => {
        //     onReviewSubmit(response.data); // Pass back the submitted data
        //     setMessage('Thank you for your review!');
        //     setIsSubmitting(false);
        //     setTimeout(onClose, 1500); // Close popup after a delay
        // }).catch(error => {
        //     setMessage('Failed to submit. Please try again.');
        //     setIsSubmitting(false);
        // });

        // Simulating a successful API call
        setTimeout(() => {
            console.log('Review Submitted:', {
                productId: product.productId,
                rating,
                reviewText
            });
            onReviewSubmit({ productId: product.productId, rating, reviewText });
            setMessage('Review submitted successfully!');
            setIsSubmitting(false);
            setTimeout(onClose, 1500); // Close popup after a short delay
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-11/12 max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
                >
                    &times;
                </button>
                <div className='mb-4'>
                    <Title text1={`RATE`} text2={product.name} />
                </div>
                <div className="flex justify-center my-4">
                    {[...Array(5)].map((star, index) => {
                        const currentRating = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={currentRating}
                                    onClick={() => setRating(currentRating)}
                                    className="hidden"
                                />
                                <FaStar
                                    className="cursor-pointer transition-colors duration-200"
                                    size={40}
                                    color={currentRating <= rating ? "#ffc107" : "#e4e5e9"}
                                />
                            </label>
                        );
                    })}
                </div>
                <form onSubmit={handleSubmit} className="mt-4">
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full h-24 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-200"
                    />
                    <div className="text-center mt-4">
                        {message && <p className="text-sm my-2">{message}</p>}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingPopup;

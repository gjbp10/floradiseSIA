import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 font-sans text-gray-700">
      
      {/* Section Header */}
      <div className="text-3xl md:text-4xl text-center pt-12 border-t border-gray-200 mb-8">
        <Title text1="ABOUT" text2="US" />
      </div>

      {/* About Content */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12 mb-16">
        <img
          className="w-full md:max-w-[450px] rounded-lg shadow-lg transition-transform hover:scale-105"
          src={assets.about_img}
          alt="About Us"
        />
        <div className="mt-8 md:mt-0 flex-1 flex flex-col justify-center gap-6 text-gray-600 text-lg leading-relaxed">
          <p>
          Floradise was born from a deep love for nature and a desire to bring its beauty into people's lives. Our journey began with a simple idea: to create a platform where anyone could easily discover, explore, and purchase a stunning variety of plants and flowers to transform their living spaces.          </p>
          <p>
        Since our inception, we've worked tirelessly to cultivate a diverse selection of high-quality botanical products that cater to every style and preference. Our products focus on helping you create your own personal paradise, whether through a single statement plant or an entire indoor garden. We source our collections from trusted local growers and suppliers to guarantee the freshest and most vibrant quality.          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Mission</h3>
            <p>
        Our mission at Floradise is to empower customers with the joy, knowledge, and confidence to connect with nature. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="text-3xl md:text-4xl text-center py-8 border-t border-gray-200 mb-12">
        <Title text1="WHY" text2="CHOOSE US" />
      </div>

      {/* Features Cards */}
      <div className="flex flex-col md:flex-row md:space-x-8 mb-20 px-4 max-w-7xl mx-auto">
        {[
          {
            title: 'Quality Assurance',
            description:
              'We meticulously select and vet each product to ensure it meets our stringent quality standards.',
          },
          {
            title: 'Convenience',
            description:
              'With our user-friendly interface and hassle-free ordering process, shopping has never been easier.',
          },
          {
            title: 'Exceptional Customer Service',
            description:
              'Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg shadow-md p-6 mb-6 md:mb-0 flex-1 transition-transform hover:shadow-xl hover:-translate-y-1"
          >
            <h4 className="text-lg font-semibold mb-3 text-gray-800">{feature.title}</h4>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <NewsletterBox />
      </div>
    </div>
  )
}

export default About
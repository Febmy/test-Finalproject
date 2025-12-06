// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";
import { Globe, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-teal-900 via-blue-900 to-purple-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Globe className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">TravelApp</h2>
                <p className="text-blue-200 text-sm">Smart Travel Companion</p>
              </div>
            </div>
            <p className="text-blue-100">
              Platform travel terintegrasi dengan API Travel Journal untuk
              pengalaman perjalanan terbaik.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-300 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-300 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-300 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-blue-100 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/activity"
                  className="text-blue-100 hover:text-white transition"
                >
                  Activities
                </Link>
              </li>
              <li>
                <Link
                  to="/promos"
                  className="text-blue-100 hover:text-white transition"
                >
                  Promos
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="text-blue-100 hover:text-white transition"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help-center"
                  className="text-blue-100 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/help-center"
                  className="text-blue-100 hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-blue-100 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-blue-100 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-blue-100 mb-4">
              Subscribe untuk mendapatkan promo dan update terbaru.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-r-lg font-medium transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-blue-200">
            © {new Date().getFullYear()} TravelApp. All rights reserved. | Final
            Project Frontend Bootcamp
          </p>
          <p className="text-blue-200 text-sm mt-2">
            API Travel Journal • bootcamp.do.dibimbing.id
          </p>
        </div>
      </div>
    </footer>
  );
}

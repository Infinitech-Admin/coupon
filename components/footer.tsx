"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Home,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-[#1c2156] text-gray-200 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Home className="h-6 w-6 text-white" />
              <span className="font-bold text-xl text-white">
                RLC Residences
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Building better lives through quality homes and vibrant
              communities for the Filipino family.
            </p>
            <div className="flex gap-4">
              <a
                aria-label="Facebook"
                className="text-gray-300 hover:text-white transition-colors"
                href="#"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                aria-label="Twitter"
                className="text-gray-300 hover:text-white transition-colors"
                href="#"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                aria-label="Instagram"
                className="text-gray-300 hover:text-white transition-colors"
                href="#"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                aria-label="LinkedIn"
                className="text-gray-300 hover:text-white transition-colors"
                href="#"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/properties", label: "Properties" },
                { href: "/news", label: "News & Updates" },
                { href: "/careers", label: "Careers" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group"
                    href={link.href}
                  >
                    <span>{link.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">
              Properties
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/properties/metro-manila", label: "Metro Manila" },
                { href: "/properties/cebu", label: "Cebu" },
                { href: "/properties/davao", label: "Davao" },
                { href: "/properties/all", label: "View All Properties" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 group"
                    href={link.href}
                  >
                    <span>{link.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1 group-hover:ml-0">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-white text-lg mb-4">
              Contact Us
            </h3>
            <address className="not-italic space-y-3 text-sm text-gray-300">
              {/* Clickable Google Maps Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <a
                  className="hover:text-white transition-colors"
                  href="https://www.google.com/maps?q=25F+Robinsons+Cyberscape+Alpha,+Sapphire+and+Garnet+Roads,+Ortigas+Center,+Pasig+City,+Philippines"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <p>25F Robinsons Cyberscape Alpha</p>
                  <p>Sapphire and Garnet Roads, Ortigas Center</p>
                  <p>Pasig City, Philippines</p>
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 pt-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a
                  className="hover:text-white transition-colors"
                  href="tel:+63283971100"
                >
                  +63 (2) 8397 1100
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a
                  className="hover:text-white transition-colors"
                  href="mailto:info@rlcresidences.com"
                >
                  info@rlcresidences.com
                </a>
              </div>
            </address>
          </div>
        </div>

        <Separator className="my-8 bg-[#2a3070]" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} RLC Residences. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/sitemap", label: "Sitemap" },
            ].map((link) => (
              <Link
                key={link.href}
                className="text-gray-300 hover:text-white transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

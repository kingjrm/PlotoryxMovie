"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [qrModalActive, setQrModalActive] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setBackToTopVisible(true);
      } else {
        setBackToTopVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Close QR modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && qrModalActive) {
        setQrModalActive(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [qrModalActive]);

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-container">
          <div className="footer-grid">
            {/* Brand Info Column */}
            <div className="footer-col brand-col">
              <Link href="/" className="footer-brand">
                <img src="/Plotoryx-Logo.png" alt="Plotoryx" className="footer-logo" />
                <span>Plotoryx</span>
              </Link>
              <p className="footer-desc">
                Enjoy instant streaming of high-quality movies, TV shows, and anime. Completely free, with multiple streaming servers and clean interfaces.
              </p>
              <div className="footer-socials">
                <a href="#" className="social-link" aria-label="Telegram">
                  <ion-icon name="paper-plane-outline"></ion-icon>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <ion-icon name="logo-twitter"></ion-icon>
                </a>
                <a href="#" className="social-link" aria-label="Discord">
                  <ion-icon name="logo-discord"></ion-icon>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <ion-icon name="logo-github"></ion-icon>
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="footer-col links-col">
              <h4 className="footer-title">Navigation</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/movies">Movies</Link>
                </li>
                <li>
                  <Link href="/tv">TV Shows</Link>
                </li>
                <li>
                  <Link href="/genres">Genres</Link>
                </li>
                <li>
                  <Link href="/trending">Trending</Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer-col links-col">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/favorites">Watchlist</Link>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">DMCA Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
              </ul>
            </div>

            {/* Donate Column */}
            <div className="footer-col donate-col">
              <h4 className="footer-title">Support Plotoryx</h4>
              <p className="donate-desc">Help us keep the servers running and ad-free! Scan the QR Code to donate.</p>
              <div className="qr-container">
                <div className="qr-wrapper" onClick={() => setQrModalActive(true)}>
                  <img src="/QRCode.png" alt="Donate QR Code" className="qr-image" />
                  <div className="qr-scan-line"></div>
                </div>
                <div className="qr-badge">
                  <ion-icon name="cafe-outline"></ion-icon>
                  <span>Buy us a Coffee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="footer-bottom">
            <div className="copyright">
              <p>
                &copy; {currentYear} <span>PlotoryxMovie</span>. All rights reserved.
              </p>
            </div>
            <div className="footer-meta-info">
              <p>
                Made with <ion-icon name="heart" class="heart-icon"></ion-icon> for cinephiles.
              </p>
              <button
                className={`back-to-top ${backToTopVisible ? "visible" : ""}`}
                id="backToTopBtn"
                aria-label="Back to top"
                onClick={scrollToTop}
              >
                <ion-icon name="arrow-up-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* QR Code Modal */}
      {qrModalActive && (
        <div
          className="qr-modal-overlay active"
          id="qrModal"
          onClick={(e) => {
            if (e.target.id === "qrModal") setQrModalActive(false);
          }}
        >
          <div className="qr-modal-container">
            <button
              className="qr-modal-close"
              id="closeQrModalBtn"
              aria-label="Close QR Code"
              onClick={() => setQrModalActive(false)}
            >
              <ion-icon name="close-outline"></ion-icon>
            </button>
            <div className="qr-modal-content">
              <h3 className="qr-modal-title">Support Plotoryx</h3>
              <p className="qr-modal-desc">Scan, screenshot, or save this QR code to help support the site!</p>
              <div className="qr-modal-image-wrapper">
                <img src="/QRCode.png" alt="Donate QR Code Large" className="qr-modal-image" />
              </div>
              <a href="/QRCode.png" download="Plotoryx-Donate-QR.png" className="btn btn-primary qr-download-btn">
                <ion-icon name="download-outline" style={{ fontSize: "1.25rem", marginRight: "4px" }}></ion-icon> Download Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { GiKnifeFork } from "react-icons/gi";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";

export const Footer = () => {
  return (
    <div>
      {/* Top section */}
      <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
        <nav>
          <h6 className="footer-title">Discover</h6>
          <p className="link link-hover">Popular Restaurants</p>
          <p className="link link-hover">Top Rated</p>
          <p className="link link-hover">Nearby</p>
          <p className="link link-hover">New Openings</p>
        </nav>
        <nav>
          <h6 className="footer-title">For Diners</h6>
          <p className="link link-hover">My Favorites</p>
          <p className="link link-hover">Reservations</p>
          <p className="link link-hover">Dining Deals</p>
          <p className="link link-hover">Reviews</p>
        </nav>
        <nav>
          <h6 className="footer-title">Company</h6>
          <p className="link link-hover">About Dishcovery</p>
          <p className="link link-hover">Contact</p>
          <p className="link link-hover">Careers</p>
          <p className="link link-hover">Press</p>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <p className="link link-hover">Terms of Use</p>
          <p className="link link-hover">Privacy Policy</p>
          <p className="link link-hover">Cookie Policy</p>
        </nav>
      </footer>

      {/* Bottom section */}
      <footer className="footer bg-base-200 text-base-content border-base-300 border-t px-10 py-4">
        <aside className="grid-flow-col items-center">
          
          <p className="text-2xl inline-flex gap-2"> Dishcovery {<GiKnifeFork/>}</p><br/>
        </aside>
        <p className="text-sm -mt-7">Helping food lovers find the best bites since 2025</p>
        <nav className="md:place-self-center md:justify-self-end">
          <div className="grid grid-flow-col gap-4 text-2xl">
            <FaXTwitter />
            <FaYoutube />
            <FaFacebookSquare />
            <FaInstagram />
            <FaTiktok />
          </div>
        </nav>
      </footer>
    </div>
  )
}

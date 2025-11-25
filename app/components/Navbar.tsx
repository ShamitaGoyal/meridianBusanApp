import { GiKnifeFork } from "react-icons/gi";
import SearchBar from "./SearchBar";

export const Navbar = () => {
  return (
    <div className="navbar pt-5 pb-5 bg-base-100 shadow-sm border-b border-gray-100">
  <div className="flex-1">
    <p className="btn bg-white text-black border-0 shadow-none text-xl hover:bg-gray-200">Dishcovery{<GiKnifeFork />} </p>
    <SearchBar/>
  </div>
  <div className="flex gap-3 items-center">
    {/* <SearchBar/> */}
    <p className="text-sm hover:bg-gray-100 rounded-lg p-2">Restaurants</p>
    <p className="text-sm hover:bg-gray-100 rounded-lg p-2">Hotels</p>
    <p className="text-sm text-nowrap hover:bg-gray-100 rounded-lg p-2">Travel Guides</p>
    <p className="text-sm hover:bg-gray-100 rounded-lg p-2">Magazine</p>
    <p className="text-sm hover:bg-gray-100 rounded-lg p-2">Favorites</p>

    {/* <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" /> */}
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Tailwind CSS Navbar component"
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li>
          <a className="justify-between">
            Profile
            <span className="badge text-black">New</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>
  )
}

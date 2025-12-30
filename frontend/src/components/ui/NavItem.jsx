import { NavLink } from "react-router-dom"

export default function NavItem({ label, to = "#" }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded text-sm ${
          isActive
            ? "bg-purple-100 text-purple-600"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      {label}
    </NavLink>
  )
}

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import NavbarEmployer from "./NavbarEmployer";
import NavbarJobSeeker from "./NavbarJobSeeker";
import NavbarGuest from "./NavbarGuest";

export default function Navbar({ onOpenJobSeeker, onOpenEmployer }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <NavbarGuest onOpenJobSeeker={onOpenJobSeeker} onOpenEmployer={onOpenEmployer} />;
  }

  const role = String(user.role || '').toUpperCase().replace(/^ROLE_/, '');

  if (role === 'EMPLOYER') {
    return <NavbarEmployer />;
  }

  if (role === 'JOB_SEEKER') {
    return <NavbarJobSeeker />;
  }

  return null;
}

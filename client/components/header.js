import Link from 'next/link';

const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' }
  ]
    .filter(Boolean)
    .map(({ label, href }) => (
      <li key={href} className="nav-item mx-2">
        <Link href={href} className="nav-link text-decoration-none">
          {label}
        </Link>
      </li>
    ));

  return (
    <nav className="navbar navbar-light bg-light px-4">
      <Link href="/" passHref>
        <span className="navbar-brand" style={{ cursor: 'pointer' }}>Pritesh</span>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links}
        </ul>
      </div>
    </nav>
  );
};

export default Header;

import { NavLink } from "react-router-dom";

const footerLinks = [
    { label: "Home", to: "/" },
    { label: "About us", to: "/about" },
    { label: "Features", to: "/features" },
    { label: "Contact", to: "/contact" },
];

const Footer = () => {
    return (
        <footer
            id="footer"
            className="
        flex flex-row
        min-h-auto
        p-20 py-15
        bg-neutral-200
        relative justify-center
      "
        >
            <div className="flex items-center divide-x divide-neutral-500/50">
                {footerLinks.map((link) => (
                    <NavLink key={link.label} to={link.to} className="px-4 text-lg">
                        {link.label}
                    </NavLink>
                ))}
                <a
                    href="https://github.com/tarun-hu/Smart-Saathi"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 text-lg"
                >
                    Github
                </a>
            </div>
        </footer>
    );
};

export default Footer;
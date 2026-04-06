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
        flex
        min-h-auto
        px-4 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-12 xl:px-20 xl:py-15
        bg-neutral-200
        relative justify-center
      "
        >
            <div className="flex flex-wrap items-center justify-center gap-y-2 divide-x divide-neutral-500/50">
                {footerLinks.map((link) => (
                    <NavLink key={link.label} to={link.to} className="px-3 sm:px-4 text-sm sm:text-base lg:text-lg">
                        {link.label}
                    </NavLink>
                ))}
                <a
                    href="https://github.com/tarun-hu/Smart-Saathi"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 sm:px-4 text-sm sm:text-base lg:text-lg"
                >
                    Github
                </a>
            </div>
        </footer>
    );
};

export default Footer;
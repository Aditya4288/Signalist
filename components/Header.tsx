import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";
import UserDropdown from "./UserDropDown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

const Header = async ({ user }: { user: User }) => {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/" className="flex items-center justify-center gap-4">
                    <Image
                        src="/assets/icons/logo.png"
                        alt="Signalist logo"
                        width={32}
                        height={32}
                        className="cursor-pointer"
                    />
                    <span className="font-bold text-white text-3xl">Signalist</span>
                </Link>

                <nav className="hidden sm:block">
                    <NavItems initialStocks={initialStocks} />
                </nav>

                <UserDropdown user={user} initialStocks={initialStocks} />
            </div>
        </header>
    );
};

export default Header;
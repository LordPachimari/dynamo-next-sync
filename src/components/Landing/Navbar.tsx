import Link from "next/link";
import Image from "next/image";
import { Accordion } from "~/ui/Accordion";

const Navbar = () => {
  const navigation = ["Product", "Features", "Pricing", "Company", "Blog"];

  return (
    <div className="sticky top-0 z-50 flex h-20 w-screen justify-center backdrop-blur-md">
      <nav className="container relative mx-auto flex  flex-wrap items-center justify-between p-8 lg:justify-between xl:px-0">
        {/* Logo  */}
        <Accordion type="single" collapsible>
          <>
            <div className="flex w-full flex-wrap items-center justify-between lg:w-auto">
              <Link href="/">
                <span className="flex items-center space-x-2 text-2xl font-medium text-blue-9 dark:text-gray-100">
                  <span>
                    {/* <Image
                      src="/img/logo.svg"
                      alt="N"
                      width="32"
                      height="32"
                      className="w-8"
                    /> */}
                  </span>
                  <span>Studlancer</span>
                </span>
              </Link>
            </div>
          </>
        </Accordion>

        {/* menu  */}
        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="flex-1 list-none items-center justify-end pt-6 lg:flex lg:pt-0">
            {navigation.map((menu, index) => (
              <li className="nav__item mr-3" key={index}>
                <Link
                  href="/"
                  className="focus:text-bluie-9 inline-block rounded-md px-4 py-2 text-lg font-normal text-gray-800 no-underline hover:text-blue-9 focus:bg-blue-4 focus:outline-none dark:text-gray-200 dark:focus:bg-gray-800"
                >
                  {menu}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav__item mr-3 hidden space-x-4 lg:flex">
          <Link
            href="/quests"
            className="rounded-md bg-blue-9 px-6 py-2 text-white md:ml-5"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

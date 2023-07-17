import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";
import Hero from "~/components/Landing/Hero";
import LandingPageButtons from "~/components/Landing/LandingPageButtons";
import Navbar from "~/components/Landing/Navbar";
import { forCompanies, forIndividuals } from "~/components/Landing/Data";
import SectionTitle from "~/components/Landing/SectionTitle";
import Faq from "~/components/Landing/Faq";
import Cta from "~/components/Landing/Cta";
import Footer from "~/components/Landing/Footer";
import Benefits from "~/components/Landing/Benefits";
export default function GlobalLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex justify-center">
        <div className="w-10/12  md:w-9/12">
          <>
            <title>
              Nextly - Free Nextjs & TailwindCSS Landing Page Template
            </title>
          </>

          <Hero>{children}</Hero>

          <Benefits imgPos="left" data={forIndividuals} />
          <Benefits imgPos="right" data={forCompanies} />

          <Footer />
        </div>
      </div>
    </>
  );
}

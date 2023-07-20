import { ReactNode } from "react";
import Benefits from "~/components/Landing/Benefits";
import { forCompanies, forIndividuals } from "~/components/Landing/Data";
import Footer from "~/components/Landing/Footer";
import Hero from "~/components/Landing/Hero";
import Navbar from "~/components/Landing/Navbar";
export default function LandingLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex justify-center">
        <div className="w-10/12  md:w-9/12">
          <Hero>{children}</Hero>
          <Benefits imgPos="left" data={forIndividuals} />
          <Benefits imgPos="right" data={forCompanies} />
          <Footer />
        </div>
      </div>
    </>
  );
}

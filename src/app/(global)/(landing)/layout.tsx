import { ReactNode } from "react";
import LandingPageButtons from "~/components/LandingPage/LandingPageButtons";

const forIndividuals: { heading: string; description: string }[] = [
  {
    heading: "Skill enhancement",
    description:
      "Stand out in the job market or your industry by showcasing your unique combination of skills and achievements earned through solving Studlancer's quests.",
  },
  {
    heading: "Flexible Learning",
    description:
      "Choose quests and topics that fit your needs and preferences, allowing you to learn at your own pace and in line with your personal or career goals.",
  },
  {
    heading: "Rewarding Progress",
    description:
      "Earn diamonds, experience, and achievements as you successfully complete quests. Use your achievements to showcase your expertise and motivate yourself to reach new heights",
  },
  {
    heading: "Collaborative environment",
    description:
      " Build connections and network with fellow learners. Studlancer introduces guild and global chat for different topics, allowing you to connect and form a group of like-minded individuals! ",
  },
];
const forCompanies: { heading: string; description: string }[] = [
  {
    heading: "Crowdsourced Solutions",
    description:
      " Gain access to a variety of innovative solutions and perspectives from a diverse pool of users, enabling you to tackle challenges more effectively.",
  },
  {
    heading: "Talent discovery",
    description:
      "Identify skilled individuals who excel in the quests you've posted, making it easier to find potential employees, collaborators, or partners for your organization or projects.",
  },

  {
    heading: "Brand exposure",
    description:
      " Enhance your brand recognition and reputation by creating high-quality, engaging quests that showcase your organization's expertise and commitment to learning.",
  },
  {
    heading: "Community Building",
    description:
      "Develop a network of individuals who are passionate about your subject matter or industry, creating a supportive community that fosters knowledge exchange and collaboration.",
  },
];
export default function GlobalLayout({
  children, // will be a page or nested layout
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="flex w-full flex-col justify-center lg:flex-row">
        <div className="lg:w-4/7 min-h-screen w-full ">
          <div className="flex h-screen w-full flex-col items-center justify-center px-5">
            <h1 className="text-center text-5xl font-black">
              Welcome to studlancer
            </h1>
            <p className="md pt-5 text-center font-bold">
              Unleash your potential by conquering quests and leveling up your
              skill!
            </p>

            <div className="flex flex-col justify-center gap-5 pt-10">
              <LandingPageButtons />
            </div>
          </div>
        </div>
        <div className="al lg:w-3/7 flex h-screen w-full items-baseline justify-center lg:items-center ">
          {children}
        </div>
      </div>
      <div className="full">
        <div className="flex h-fit w-full flex-col justify-center bg-white p-10">
          <div className="flex h-4/6 flex-col items-center justify-center gap-10 lg:flex-row">
            <h1 className="text-3xl font-bold">For individuals</h1>
          </div>

          <div className="flex h-4/6 flex-col items-center justify-center gap-10 pt-10 lg:flex-row">
            {forIndividuals.map((info, i) => (
              <div className="h-full w-full pb-5" key={i}>
                <h2 className="h-10 text-center text-xl font-bold">
                  {info.heading}
                </h2>
                <p className="h-40 pt-2">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="full">
        <div className="flex h-fit w-full flex-col justify-center bg-gray-100 p-10">
          <div className="flex h-4/6 flex-col items-center justify-center gap-10  lg:flex-row">
            <h1 className="text-3xl font-bold">For companies</h1>
          </div>

          <div className="flex h-4/6 flex-col items-center justify-center gap-10 pt-10 lg:flex-row">
            {forCompanies.map((info, i) => (
              <div className="h-full w-full pb-5" key={i}>
                <h2 className="h-10 text-center text-xl font-bold">
                  {info.heading}
                </h2>
                <p className="h-40 pt-2">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-fit w-full flex-col border-t-2 border-gray-200 bg-white p-16 lg:flex-row">
        <div className="flex w-[100] flex-col lg:w-2/6">
          <h2>Studlancer</h2>
          <p>Links</p>
        </div>
        <div className="flex">
          <div className="flex flex-col gap-2">
            <h2>Company</h2>
            <p>About us</p>

            <p>Jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

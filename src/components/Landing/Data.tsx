import { SmileIcon } from "lucide-react";

const forIndividuals = {
  title: "For individuals",
  // image: benefitOneImg,
  bullets: [
    {
      title: "Skill enhancement",
      desc: "Stand out in the job market or your industry by showcasing your unique combination of skills and achievements earned through solving Studlancer's quests.",
      icon: SmileIcon,
    },
    {
      title: "Flexible Learning",
      desc: "Choose quests and topics that fit your needs and preferences, allowing you to learn at your own pace and in line with your personal or career goals.",
      // icon: <ChartBarSquareIcon />,
      icon: SmileIcon,
    },
    {
      title: "Rewarding Progress",
      desc: "Earn diamonds, experience, and achievements as you successfully complete quests. Use your achievements to showcase your expertise and motivate yourself to reach new heights",
      // icon: <CursorArrowRaysIcon />,
      icon: SmileIcon,
    },
  ],
};

const forCompanies = {
  title: "For companies",
  desc: "You can use this same layout with a flip image to highlight your rest of the benefits of your product. It can also contain an image or Illustration as above section along with some bullet points.",
  // image: benefitTwoImg,
  bullets: [
    {
      title: "Crowdsourced Solutions",
      desc: "Gain access to a variety of innovative solutions and perspectives from a diverse pool of users, enabling you to tackle challenges more effectively.",
      // icon: <DevicePhoneMobileIcon />,
      icon: SmileIcon,
    },
    {
      title: "Talent discovery",
      desc: "Identify skilled individuals who excel in the quests you've posted, making it easier to find potential employees, collaborators, or partners for your organization or projects.",
      // icon: <AdjustmentsHorizontalIcon />,
      icon: SmileIcon,
    },

    {
      title: "Community Building",
      desc: "Develop a network of individuals who are passionate about your subject matter or industry, creating a supportive community that fosters knowledge exchange and collaboration.",
      // icon: <SunIcon />,
      icon: SmileIcon,
    },
  ],
};

export { forIndividuals, forCompanies };

import { TwitterIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { UpdateUserAttributesZod, getEntries } from "~/types/types";
import { Badge } from "~/ui/Badge";
import { Card, CardContent, CardFooter } from "~/ui/Card";
import { Dialog, DialogContent, DialogHeader } from "~/ui/Dialog";
import { Progress } from "~/ui/Progress";

export default function AboutUser({
  username,
  about,
  level,
  experience,
  links,
  isEditable,
}: {
  username: string;
  about: string | undefined;
  level: number;
  experience: number;
  links: { value: string }[] | undefined;
  isEditable: boolean;
}) {
  return (
    <Card className="relative h-[350px] w-full rounded-xl p-0 drop-shadow-md  dark:border-slate-6 dark:bg-slate-3">
      <CardContent className="h-fit p-5">
        <div className="flex  items-center justify-between gap-2">
          <Badge className="w-16 bg-red-500 text-sm">{level} lvl</Badge>
          <div className="w-10/12">
            <Progress value={33} />
          </div>
          {isEditable && (
            <>
              {/* <IconButton
                aria-label="edit-profile"
                bg="none"
                ml={2}
                onClick={onOpen}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path
                      d="M12.6844 4.02535C12.4588 4.00633 12.2306 3.99658 12 3.99658C7.58172 3.99658 4 7.5783 4 11.9966C4 16.4149 7.58172 19.9966 12 19.9966C16.4183 19.9966 20 16.4149 20 11.9966C20 11.766 19.9902 11.5378 19.9711 11.3122C19.8996 10.4644 19.6953 9.64408 19.368 8.87332L20.8682 7.37102C21.2031 8.01179 21.4706 8.69338 21.6613 9.40637C21.8213 10.0062 21.9258 10.6221 21.9723 11.2479C21.9907 11.4951 22 11.7447 22 11.9966C22 17.5194 17.5228 21.9966 12 21.9966C6.47715 21.9966 2 17.5194 2 11.9966C2 6.47373 6.47715 1.99658 12 1.99658C12.2518 1.99658 12.5015 2.00589 12.7487 2.02419C13.3745 2.07069 13.9904 2.17529 14.5898 2.33568C15.3032 2.52597 15.9848 2.79347 16.6256 3.12837L15.1247 4.62922C14.3525 4.30131 13.5321 4.09695 12.6844 4.02535ZM20.4853 2.09709L21.8995 3.5113L12.7071 12.7037L11.2954 12.7062L11.2929 11.2895L20.4853 2.09709Z"
                      fill="var(--blue)"
                    ></path>
                  </svg>
                }
              /> */}
              {/* <EditProfile
                onClose={onClose}
                isOpen={isOpen}
                onOpen={onOpen}
                username={username}
                about={about}
                level={level}
                links={links}
                isLoading={isLoading}
              /> */}
            </>
          )}
        </div>

        <h2 className="my-2 font-bold">{username}</h2>
        <p>{about && about}</p>
      </CardContent>
      <CardFooter className="absolute bottom-0 flex h-fit flex-col items-start px-5 pb-2">
        <div className="flex gap-2">
          <TwitterIcon className="text-blue-9" size={20} />
          <p className="text-blue-9 ">{links && links[0]?.value}</p>
        </div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M13.914 14.58a8.998 8.998 0 0 1-.484.104 7.06 7.06 0 0 1-2.664-.01c-.154-.03-.372-.083-.653-.158l-.921 1.197c-2.273-.073-3.137-1.596-3.137-1.596 0-3.381 1.481-6.122 1.481-6.122 1.481-1.133 2.89-1.102 2.89-1.102l.403.525a1.12 1.12 0 0 1 .112-.01 8.527 8.527 0 0 1 2.314.01l.442-.525s1.41-.031 2.89 1.103c0 0 1.482 2.74 1.482 6.121 0 0-.875 1.522-3.148 1.596l-1.007-1.134zM10.076 11C9.475 11 9 11.45 9 12s.485 1 1.076 1c.6 0 1.075-.45 1.075-1 .01-.55-.474-1-1.075-1zm3.848 0c-.6 0-1.075.45-1.075 1s.485 1 1.075 1c.601 0 1.076-.45 1.076-1s-.475-1-1.076-1zM21 23l-4.99-5H19V4H5v14h11.003l.57 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v19z"
              fill="rgba(128,90,213,1)"
            />
          </svg>
          <div className="text-purple-9"></div>
        </div>
      </CardFooter>
    </Card>
  );
}
type LinkState = {
  value: {
    twitter: {
      value: string;
    };
    discord: { value: string };
  };
  updated: boolean;
};
type UserInfoState = {
  username: { value: string; updated: boolean };
  about: { value: string; updated: boolean };
  links: LinkState;
};
// const EditProfile = ({
//   username,
//   about,
//   level,
//   links,
//   onOpen,
//   onClose,
//   isOpen,

//   isLoading,
// }: {
//   username: string;
//   about: string | undefined;
//   level: number;
//   links: { twitter: string; discord: string } | undefined;

//   isLoading: boolean;
//   isOpen: boolean;
//   onOpen: () => void;
//   onClose: () => void;
// }) => {
//   const [errorMessage, setErrorMessage] = useState("");

//   const [isSaving, setIsSaving] = useState(false);

//   const [userInfo, setUserInfo] = useState<UserInfoState>({
//     username: { value: username, updated: false },
//     about: { value: about || "", updated: false },
//     links: {
//       value: {
//         twitter: {
//           value: links && links.twitter ? links.twitter : "",
//         },
//         discord: { value: links && links.discord ? links.discord : "" },
//       },
//       updated: false,
//     },
//   });
//   const checkIfValueIsTheSame = ({
//     key,
//     value,
//   }: {
//     key: "username" | "about" | "links";
//     value: { value: string; updated: boolean } | LinkState;
//   }) => {
//     // if(){}
//     if (key === "username") {
//       if (value.value === username) {
//         return true;
//       }
//     }
//     if (key === "about") {
//       if ((value.value === "" && !about) || value.value === about) {
//         return true;
//       }
//     }
//     if (key === "links") {
//       const linksValue = value as LinkState;
//       const serverDiscordLink = !links
//         ? ""
//         : links.discord
//         ? links.discord
//         : "";

//       const serverTwitterLink = !links
//         ? ""
//         : links.twitter
//         ? links.twitter
//         : "";

//       if (
//         linksValue.value.discord.value === serverDiscordLink &&
//         linksValue.value.twitter.value === serverTwitterLink
//       ) {
//         return true;
//       }
//     }
//   };
//   const valueUpdated = getEntries(userInfo).some(
//     ([key, value]) =>
//       value.updated === true && !checkIfValueIsTheSame({ key, value })
//   );
//   const handleSave = () => {
//     if (valueUpdated) {
//       const parameters = {
//         username: userInfo.username.updated
//           ? userInfo.username.value
//           : username,
//         ...(userInfo.about.updated && { about: userInfo.about.value }),
//         ...(userInfo.links.updated && {
//           links: {
//             twitter: userInfo.links.value.twitter.value || "",
//             discord: userInfo.links.value.discord.value || "",
//           },
//         }),
//       };
//       const parseResult = UpdateUserAttributesZod.safeParse(parameters);

//       if (!parseResult.success) {
//         const errors: Record<string, { error: boolean; message: string }> = {};
//         parseResult.error.issues.forEach(
//           (e) =>
//             (errors[e.path[0] as string] = { error: true, message: e.message })
//         );
//         console.log("errors", errors);
//       } else {
//       }
//     }
//   };

//   return (
//     <Dialog>
//       <DialogContent>
//         <DialogHeader>Edit Profile</DialogHeader>
//         <p className="text-500 ml-6" color="red" ml="6">
//           {errorMessage}
//         </p>
//         <DialogContent>
//           <FormControl display="flex" alignItems="center" my={4}>
//             <FormLabel w="24">Username</FormLabel>
//             <Input
//               ref={initialRef}
//               placeholder="First name"
//               value={userInfo.username.value}
//               // isDisabled={isLoading}
//               isDisabled={true}
//               onChange={(e) =>
//                 setUserInfo(
//                   produce((info) => {
//                     info.username.updated = true;
//                     info.username.value = e.target.value;
//                   })
//                 )
//               }
//             />
//           </FormControl>

//           <Divider />

//           <FormControl my={4} display="flex" alignItems="center">
//             <FormLabel w="24">About</FormLabel>
//             <Textarea
//               isDisabled={isLoading}
//               placeholder="Tell us about yourself!"
//               value={userInfo.about.value}
//               onChange={(e) =>
//                 setUserInfo(
//                   produce((info) => {
//                     info.about.updated = true;
//                     info.about.value = e.target.value;
//                   })
//                 )
//               }
//             />
//           </FormControl>
//           <Divider />

//           <FormControl display="flex" my={4} alignItems="center">
//             <FormLabel w="24">Links</FormLabel>
//             <HStack>
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 width="24"
//                 height="24"
//               >
//                 <path fill="none" d="M0 0h24v24H0z" />
//                 <path
//                   d="M15.3 5.55a2.9 2.9 0 0 0-2.9 2.847l-.028 1.575a.6.6 0 0 1-.68.583l-1.561-.212c-2.054-.28-4.022-1.226-5.91-2.799-.598 3.31.57 5.603 3.383 7.372l1.747 1.098a.6.6 0 0 1 .034.993L7.793 18.17c.947.059 1.846.017 2.592-.131 4.718-.942 7.855-4.492 7.855-10.348 0-.478-1.012-2.141-2.94-2.141zm-4.9 2.81a4.9 4.9 0 0 1 8.385-3.355c.711-.005 1.316.175 2.669-.645-.335 1.64-.5 2.352-1.214 3.331 0 7.642-4.697 11.358-9.463 12.309-3.268.652-8.02-.419-9.382-1.841.694-.054 3.514-.357 5.144-1.55C5.16 15.7-.329 12.47 3.278 3.786c1.693 1.977 3.41 3.323 5.15 4.037 1.158.475 1.442.465 1.973.538z"
//                   fill="rgba(50,152,219,1)"
//                 />
//               </svg>

//               <Input
//                 isDisabled={isLoading}
//                 placeholder="@"
//                 value={userInfo.links.value.twitter.value}
//                 onChange={(e) =>
//                   setUserInfo(
//                     produce((info) => {
//                       info.links.updated = true;
//                       info.links.value.twitter.value = e.target.value;
//                     })
//                   )
//                 }
//               />
//             </HStack>
//             <HStack ml="5">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 width="24"
//                 height="24"
//               >
//                 <path fill="none" d="M0 0h24v24H0z" />
//                 <path
//                   d="M13.914 14.58a8.998 8.998 0 0 1-.484.104 7.06 7.06 0 0 1-2.664-.01c-.154-.03-.372-.083-.653-.158l-.921 1.197c-2.273-.073-3.137-1.596-3.137-1.596 0-3.381 1.481-6.122 1.481-6.122 1.481-1.133 2.89-1.102 2.89-1.102l.403.525a1.12 1.12 0 0 1 .112-.01 8.527 8.527 0 0 1 2.314.01l.442-.525s1.41-.031 2.89 1.103c0 0 1.482 2.74 1.482 6.121 0 0-.875 1.522-3.148 1.596l-1.007-1.134zM10.076 11C9.475 11 9 11.45 9 12s.485 1 1.076 1c.6 0 1.075-.45 1.075-1 .01-.55-.474-1-1.075-1zm3.848 0c-.6 0-1.075.45-1.075 1s.485 1 1.075 1c.601 0 1.076-.45 1.076-1s-.475-1-1.076-1zM21 23l-4.99-5H19V4H5v14h11.003l.57 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v19z"
//                   fill="rgba(128,90,213,1)"
//                 />
//               </svg>

//               <Input
//                 placeholder="username"
//                 value={userInfo.links.value.discord.value}
//                 isDisabled={isLoading}
//                 onChange={(e) =>
//                   setUserInfo(
//                     produce((info) => {
//                       info.links.updated = true;
//                       info.links.value.discord.value = e.target.value;
//                     })
//                   )
//                 }
//               />
//             </HStack>
//           </FormControl>
//           <Divider />
//         </DialogContent>

//         <ModalFooter>
//           <Button
//             isDisabled={!valueUpdated || userInfo.username.value.length < 2}
//             colorScheme="blue"
//             mr={3}
//             onClick={handleSave}
//             isLoading={updateUserAttributes.isLoading || isSaving}
//           >
//             Save
//           </Button>
//           <Button
//             isDisabled={updateUserAttributes.isLoading || isSaving}
//             onClick={() => {
//               setUserInfo({
//                 about: { updated: false, value: about || "" },
//                 links: {
//                   updated: false,
//                   value: {
//                     discord: {
//                       value: links && links.discord ? links.discord : "",
//                     },
//                     twitter: {
//                       value: links && links.twitter ? links.twitter : "",
//                     },
//                   },
//                 },
//                 username: { value: username, updated: false },
//               });

//               onClose();
//             }}
//           >
//             Cancel
//           </Button>
//         </ModalFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

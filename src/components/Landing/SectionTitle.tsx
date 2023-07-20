import React, { ReactNode } from "react";

const SectionTitle = (props: {
  pretitle: string;
  title: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`"items-center mt-4 flex w-full flex-col justify-center text-center`}
    >
      {props.pretitle && (
        <div className="text-sm font-bold uppercase tracking-wider text-blue-9">
          {props.pretitle}
        </div>
      )}

      {props.title && (
        <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-gray-800 dark:text-white lg:text-4xl lg:leading-tight">
          {props.title}
        </h2>
      )}

      {props.children && (
        <p className="max-w-2xl py-4 text-lg leading-normal text-gray-500 dark:text-gray-300 lg:text-xl xl:text-xl">
          {props.children}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
